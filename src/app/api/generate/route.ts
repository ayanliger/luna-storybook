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
        // Step 1: Plan the story
        send({ type: "status", message: "Luna is composing your story..." });

        const plan = await planStory(theme, body.previousContext);
        send({ type: "title", content: plan.title });
        send({
          type: "status",
          message: "The painter dips her brush...",
        });

        // Step 2: Generate pages one at a time
        const pages = [];
        for (let i = 0; i < plan.stanzas.length; i++) {
          const previousPassages = pages.map((p) => p.poem);
          const page = await generateSinglePage(plan, i, previousPassages);
          pages.push(page);

          send({ type: "stanza", page: page.pageNumber, poem: page.poem });
          send({
            type: "image",
            page: page.pageNumber,
            data: page.image.data,
            mimeType: page.image.mimeType,
          });
        }

        // Step 3: Generate TTS narration (delay to avoid rate limiting after image calls)
        await new Promise((r) => setTimeout(r, 3000));
        send({
          type: "status",
          message: "Finding the voice for your story...",
        });

        try {
          const fullPoem = pages.map((p) => p.poem).join("\n\n");
          const audio = await generateNarration(fullPoem);
          send({
            type: "audio",
            page: 0,
            data: audio.data,
            mimeType: audio.mimeType,
          });
        } catch (ttsErr) {
          console.error("TTS generation failed:", ttsErr);
          // Retry once after a short delay
          try {
            await new Promise((r) => setTimeout(r, 2000));
            const fullPoem = pages.map((p) => p.poem).join("\n\n");
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

        // Send branching choices
        send({
          type: "choices",
          options: plan.choices.map((c) => ({
            label: c.label,
            theme: c.themeDirection,
          })),
        });

        send({ type: "done" });
      } catch (err) {
        console.error("Generation error:", err);
        const cause = err instanceof Error ? (err.cause as Error)?.code ?? err.message : "";
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
