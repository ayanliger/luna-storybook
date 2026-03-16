import { NextRequest } from "next/server";
import { GenerateRequest } from "@/lib/types";
import {
  planStory,
  generateInterleavedContent,
  generateNarration,
} from "@/lib/gemini";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const body: GenerateRequest = await request.json();

  if (!body.theme?.trim()) {
    return new Response(JSON.stringify({ error: "Theme is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
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

        const plan = await planStory(body.theme, body.previousContext);
        send({ type: "title", content: plan.title });
        send({
          type: "status",
          message: "The painter dips her brush...",
        });

        // Step 2: Generate interleaved poetry + paintings
        const pages = await generateInterleavedContent(plan);

        for (const page of pages) {
          send({ type: "stanza", page: page.pageNumber, poem: page.poem });
          send({
            type: "image",
            page: page.pageNumber,
            data: page.image.data,
            mimeType: page.image.mimeType,
          });
        }

        // Step 3: Generate TTS narration
        send({
          type: "status",
          message: "Finding the voice for your poem...",
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
        } catch {
          // TTS failure is non-critical — story works without audio
          console.error("TTS generation failed, continuing without audio");
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
        send({
          type: "error",
          message:
            err instanceof Error ? err.message : "Something went wrong.",
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
