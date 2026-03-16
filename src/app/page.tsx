"use client";

import { useState, useCallback, useRef } from "react";
import StoryInput from "@/components/StoryInput";
import StoryBook from "@/components/StoryBook";
import LoadingState from "@/components/LoadingState";
import { StoryPage, SSEEvent } from "@/lib/types";
import { exportMarkdown, exportPDF } from "@/lib/export";

export default function Home() {
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [choices, setChoices] = useState<{ label: string; theme: string }[]>([]);
  const [audios, setAudios] = useState<Array<{ data: string; mimeType: string; startPage: number; endPage: number }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  // Context for continuation
  const [mood, setMood] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const pageOffsetRef = useRef(0);

  const handleSSEEvent = useCallback(
    (event: SSEEvent) => {
      switch (event.type) {
        case "status":
          setStatusMessage(event.message as string);
          break;
        case "title":
          // Only update title for the first chapter
          if (pageOffsetRef.current === 0) {
            setTitle(event.content as string);
          }
          break;
        case "stanza": {
          const pageNum = (event.page as number) + pageOffsetRef.current;
          setPages((prev) => {
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
        }
        case "image":
          setPages((prev) => {
            const pageNum = (event.page as number) + pageOffsetRef.current;
            return prev.map((p) =>
              p.pageNumber === pageNum
                ? {
                    ...p,
                    image: {
                      data: event.data as string,
                      mimeType: event.mimeType as string,
                    },
                  }
                : p
            );
          });
          break;
        case "audio": {
          const startPage = pageOffsetRef.current + 1;
          const endPage = pageOffsetRef.current + 5;
          setAudios((prev) => [
            ...prev,
            {
              data: event.data as string,
              mimeType: event.mimeType as string,
              startPage,
              endPage,
            },
          ]);
          break;
        }
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
        pageOffsetRef.current = 0;
        setTitle("");
        setPages([]);
        setChoices([]);
        setAudios([]);
        setMood("");
        setColorPalette("");
      } else {
        pageOffsetRef.current = pages.length;
        setChoices([]);
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

        if (!response.ok) {
          const err = await response.json().catch(() => null);
          throw new Error(err?.error || "Failed to start generation");
        }
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
    <main className="min-h-screen bg-canvas-cream relative">
      {/* Book-page vignette over entire page */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(26, 26, 31, 0.05) 100%)',
        }}
      />
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
          audios={audios}
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
        <div className="text-center py-12 border-t border-canvas-linen space-y-6">
          {/* Save options */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => exportMarkdown(title, pages.filter((p) => p.image.data))}
              className="flex items-center gap-2 px-5 py-3 font-sans text-xs tracking-widest uppercase
                text-ink-secondary border border-canvas-linen
                hover:border-ink-muted hover:text-ink-primary transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 1v9M4 7l3 3 3-3M2 12h10" />
              </svg>
              Save Story
            </button>
            <button
              onClick={() => exportPDF(title, pages.filter((p) => p.image.data))}
              className="flex items-center gap-2 px-5 py-3 font-sans text-xs tracking-widest uppercase
                text-ink-secondary border border-canvas-linen
                hover:border-ink-muted hover:text-ink-primary transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 1v9M4 7l3 3 3-3M2 12h10" />
              </svg>
              Save as PDF
            </button>
          </div>

          <button
            onClick={() => {
              setHasStarted(false);
              setPages([]);
              setTitle("");
              setChoices([]);
              setAudios([]);
            }}
            className="font-sans text-xs text-ink-muted uppercase tracking-widest
              hover:text-ink-primary transition-colors"
          >
            Start a new story
          </button>
        </div>
      )}
    </main>
  );
}
