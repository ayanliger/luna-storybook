"use client";

import { useState, useCallback } from "react";
import StoryInput from "@/components/StoryInput";
import StoryBook from "@/components/StoryBook";
import LoadingState from "@/components/LoadingState";
import { StoryPage, SSEEvent } from "@/lib/types";

export default function Home() {
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [choices, setChoices] = useState<{ label: string; theme: string }[]>([]);
  const [audio, setAudio] = useState<{ data: string; mimeType: string } | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  // Context for continuation
  const [mood, setMood] = useState("");
  const [colorPalette, setColorPalette] = useState("");

  const handleSSEEvent = useCallback(
    (event: SSEEvent) => {
      switch (event.type) {
        case "status":
          setStatusMessage(event.message as string);
          break;
        case "title":
          setTitle(event.content as string);
          break;
        case "stanza":
          setPages((prev) => {
            const pageNum = event.page as number;
            const existing = prev.find((p) => p.pageNumber === pageNum);
            if (existing) {
              return prev.map((p) =>
                p.pageNumber === pageNum
                  ? { ...p, poem: event.poem as string }
                  : p
              );
            }
            return [
              ...prev,
              {
                pageNumber: pageNum,
                poem: event.poem as string,
                image: { data: "", mimeType: "" },
              },
            ];
          });
          break;
        case "image":
          setPages((prev) =>
            prev.map((p) =>
              p.pageNumber === (event.page as number)
                ? {
                    ...p,
                    image: {
                      data: event.data as string,
                      mimeType: event.mimeType as string,
                    },
                  }
                : p
            )
          );
          break;
        case "audio":
          setAudio({
            data: event.data as string,
            mimeType: event.mimeType as string,
          });
          break;
        case "choices":
          setChoices(
            (event.options as { label: string; theme: string }[]) || []
          );
          break;
        case "error":
          setError(event.message as string);
          break;
      }
    },
    []
  );

  const generate = useCallback(
    async (theme: string, isNewStory: boolean) => {
      setIsGenerating(true);
      setError("");
      setStatusMessage("Luna is composing your story...");
      setHasStarted(true);

      if (isNewStory) {
        setTitle("");
        setPages([]);
        setChoices([]);
        setAudio(undefined);
        setMood("");
        setColorPalette("");
      } else {
        setChoices([]);
        setAudio(undefined);
      }

      try {
        const previousContext = isNewStory
          ? null
          : {
              title,
              mood,
              colorPalette,
              previousStanzas: pages.map((p) => p.poem),
            };

        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme, previousContext }),
        });

        if (!response.ok) throw new Error("Failed to start generation");
        if (!response.body) throw new Error("No response stream");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event: SSEEvent = JSON.parse(line.slice(6));
              handleSSEEvent(event);
            } catch {
              // Skip malformed events
            }
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setIsGenerating(false);
        setStatusMessage("");
      }
    },
    [title, mood, colorPalette, pages, handleSSEEvent]
  );

  const handleNewStory = (theme: string) => generate(theme, true);
  const handleContinue = (theme: string) => generate(theme, false);

  if (!hasStarted) {
    return <StoryInput onSubmit={handleNewStory} isGenerating={isGenerating} />;
  }

  return (
    <main className="min-h-screen bg-canvas-cream">
      {error && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-50 border-b border-red-200 px-6 py-3 text-center">
          <p className="font-sans text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-4 text-red-500 hover:text-red-700 text-xs uppercase tracking-widest"
          >
            Dismiss
          </button>
        </div>
      )}

      {isGenerating && pages.length === 0 && (
        <LoadingState message={statusMessage} />
      )}

      {pages.length > 0 && (
        <StoryBook
          title={title}
          pages={pages.filter((p) => p.image.data)}
          choices={choices}
          audio={audio}
          onChoice={handleContinue}
          isGenerating={isGenerating}
        />
      )}

      {isGenerating && pages.length > 0 && (
        <div className="text-center py-8">
          <p className="font-serif text-lg text-ink-muted italic animate-gentle-pulse">
            {statusMessage}
          </p>
        </div>
      )}

      {!isGenerating && pages.length > 0 && (
        <div className="text-center py-12 border-t border-canvas-linen">
          <button
            onClick={() => {
              setHasStarted(false);
              setPages([]);
              setTitle("");
              setChoices([]);
              setAudio(undefined);
            }}
            className="font-sans text-xs text-ink-muted uppercase tracking-widest
              hover:text-accent-gold transition-colors"
          >
            Start a new story
          </button>
        </div>
      )}
    </main>
  );
}
