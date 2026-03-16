"use client";

import StoryPageComponent from "./StoryPage";
import ChoiceButtons from "./ChoiceButtons";
import AudioPlayer from "./AudioPlayer";
import { StoryPage } from "@/lib/types";

export interface SectionAudio {
  data: string;
  mimeType: string;
  startPage: number;
  endPage: number;
}

interface StoryBookProps {
  title: string;
  pages: StoryPage[];
  choices: { label: string; theme: string }[];
  audios: SectionAudio[];
  onChoice: (theme: string) => void;
  isGenerating: boolean;
}

export default function StoryBook({
  title,
  pages,
  choices,
  audios,
  onChoice,
  isGenerating,
}: StoryBookProps) {
  return (
    <div className="min-h-screen">
      {/* Title */}
      {title && (
        <header className="text-center pt-10 pb-4 md:pt-16 md:pb-6 animate-fade-in">
          <h2 className="font-serif text-4xl md:text-6xl font-light text-ink-primary tracking-tight">
            {title}
          </h2>
          <div className="mt-6 flex justify-center">
            <div className="w-24 h-px bg-accent-gold/50" />
          </div>
        </header>
      )}

      {/* Pages + section audio players */}
      {pages.map((page) => {
        const sectionAudio = audios.find((a) => a.endPage === page.pageNumber);
        return (
          <div key={`${page.pageNumber}-${page.poem.slice(0, 20)}`}>
            <StoryPageComponent
              page={page}
              isLatest={page.pageNumber === pages.length}
            />
            {sectionAudio && (
              <div className="flex justify-center py-6">
                <AudioPlayer
                  data={sectionAudio.data}
                  mimeType={sectionAudio.mimeType}
                  startPage={sectionAudio.startPage}
                  endPage={sectionAudio.endPage}
                />
              </div>
            )}
          </div>
        );
      })}

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
