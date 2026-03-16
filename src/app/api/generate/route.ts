import { NextRequest } from "next/server";
import { GenerateRequest } from "@/lib/types";
import {
  planStory,
  generateSinglePage,
  generateNarration,
} from "@/lib/gemini";

export const maxDuration = 300;

const MAX_THEME_LENGTH = 200;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const ipHistory = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipHistory.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  ipHistory.set(ip, timestamps);
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  return false;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (process.env.NODE_ENV !== "development" && isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  const body: GenerateRequest = await request.json();

  // Sanitize: strip control chars, collapse whitespace
  const theme = (body.theme ?? "")
    .replace(/[\x00-\x1f\x7f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!theme) {
    return new Response(JSON.stringify({ error: "Theme is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (theme.length > MAX_THEME_LENGTH) {
    return new Response(
      JSON.stringify({ error: `Theme must be ${MAX_THEME_LENGTH} characters or fewer.` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        // Step 1: Plan the story (or resume from existing plan)
        let plan;
        let startPage = 0;
        const previousPassages: string[] = [];

        if (body.resumeFrom) {
          plan = body.resumeFrom.plan;
          startPage = body.resumeFrom.startPage;
          previousPassages.push(...body.resumeFrom.completedPassages);
          send({ type: "status", message: "Resuming your story..." });
        } else {
          send({ type: "status", message: "Luna is composing your story..." });
          plan = await planStory(theme, body.previousContext);
          send({ type: "title", content: plan.title });
        }

        send({ type: "plan", plan });
        send({
          type: "status",
          message: "The painter dips her brush...",
        });

        // Step 2: Generate pages one at a time (with per-page retry)
        const pages: { poem: string; image: { data: string; mimeType: string } }[] = [];
        let referenceImage: { data: string; mimeType: string } | undefined;
        let failedPage: number | null = null;

        for (let i = startPage; i < plan.stanzas.length; i++) {
          const allPassages = [...previousPassages, ...pages.map((p) => p.poem)];
          let page;
          try {
            page = await generateSinglePage(plan, i, allPassages, referenceImage);
          } catch (firstErr) {
            console.error(`Page ${i + 1} failed, retrying once:`, firstErr);
            try {
              await new Promise((r) => setTimeout(r, 2000));
              page = await generateSinglePage(plan, i, allPassages, referenceImage);
            } catch (retryErr) {
              console.error(`Page ${i + 1} retry also failed:`, retryErr);
              failedPage = i;
              break;
            }
          }

          pages.push(page);

          // Use first generated page's image as style reference for the rest
          if (pages.length === 1 && page.image.data) {
            referenceImage = { data: page.image.data, mimeType: page.image.mimeType };
          }

          send({ type: "stanza", page: page.pageNumber, poem: page.poem });
          send({
            type: "image",
            page: page.pageNumber,
            data: page.image.data,
            mimeType: page.image.mimeType,
          });
        }

        // Step 3: Generate TTS narration if we have any pages
        const allPoems = [...previousPassages, ...pages.map((p) => p.poem)];
        if (allPoems.length > 0) {
          await new Promise((r) => setTimeout(r, 3000));
          send({
            type: "status",
            message: "Finding the voice for your story...",
          });

          try {
            const fullPoem = allPoems.join("\n\n");
            const audio = await generateNarration(fullPoem);
            send({
              type: "audio",
              page: 0,
              data: audio.data,
              mimeType: audio.mimeType,
            });
          } catch (ttsErr) {
            console.error("TTS generation failed:", ttsErr);
            try {
              await new Promise((r) => setTimeout(r, 2000));
              const fullPoem = allPoems.join("\n\n");
              const audio = await generateNarration(fullPoem);
              send({
                type: "audio",
                page: 0,
                data: audio.data,
                mimeType: audio.mimeType,
              });
            } catch (retryErr) {
              console.error("TTS retry also failed:", retryErr);
            }
          }
        }

        if (failedPage !== null) {
          // Partial completion — let client know so it can retry
          send({
            type: "partial",
            failedPage: failedPage + 1,
            message: `Page ${failedPage + 1} failed to generate.`,
          });
        } else {
          // Full completion — send branching choices
          send({
            type: "choices",
            options: plan.choices.map((c) => ({
              label: c.label,
              theme: c.themeDirection,
            })),
          });
          send({ type: "done" });
        }
      } catch (err) {
        console.error("Generation error:", err);
        const cause = err instanceof Error ? (err.cause as Record<string, unknown>)?.code ?? err.message : "";
        const isTimeout = cause === "UND_ERR_HEADERS_TIMEOUT" || cause === "UND_ERR_CONNECT_TIMEOUT";
        send({
          type: "error",
          message: isTimeout
            ? "Luna took too long to respond. Please try again."
            : err instanceof Error ? err.message : "Something went wrong.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
