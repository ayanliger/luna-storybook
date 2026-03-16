"use client";

import StoryPageComponent from "./StoryPage";
import ChoiceButtons from "./ChoiceButtons";
import { StoryPage } from "@/lib/types";

interface StoryBookProps {
  title: string;
  pages: StoryPage[];
  choices: { label: string; theme: string }[];
  audio?: { data: string; mimeType: string };
  onChoice: (theme: string) => void;
  isGenerating: boolean;
}

export default function StoryBook({
  title,
  pages,
  choices,
  audio,
  onChoice,
  isGenerating,
}: StoryBookProps) {
  return (
    <div className="min-h-screen">
      {/* Title */}
      {title && (
        <header className="text-center py-16 md:py-24 animate-fade-in">
          <h2 className="font-serif text-4xl md:text-6xl font-light text-ink-primary tracking-tight">
            {title}
          </h2>
          <div className="mt-6 flex justify-center">
            <div className="w-24 h-px bg-accent-gold/50" />
          </div>
        </header>
      )}

      {/* Pages */}
      {pages.map((page) => (
        <StoryPageComponent
          key={`${page.pageNumber}-${page.poem.slice(0, 20)}`}
          page={page}
          isLatest={page.pageNumber === pages.length}
          audio={page.pageNumber === pages.length ? audio : undefined}
        />
      ))}

      {/* Branching choices */}
      {choices.length > 0 && !isGenerating && (
        <div className="animate-fade-in">
          <ChoiceButtons
            options={choices}
            onSelect={onChoice}
            disabled={isGenerating}
          />
        </div>
      )}
    </div>
  );
}
