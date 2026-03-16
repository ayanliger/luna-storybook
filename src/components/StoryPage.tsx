"use client";

import PoemText from "./PoemText";
import PaintingFrame from "./PaintingFrame";
import { StoryPage as StoryPageType } from "@/lib/types";

interface StoryPageProps {
  page: StoryPageType;
  isLatest: boolean;
  storyTitle?: string;
}

export default function StoryPage({ page, isLatest, storyTitle }: StoryPageProps) {
  return (
    <section
      className="animate-slide-up"
      style={{ animationDelay: `${(page.pageNumber - 1) * 0.15}s` }}
    >
      <div className="pt-8 pb-12 md:pt-12 md:pb-20">
        {/* Painting */}
        <div className="animate-fade-in mb-10 md:mb-14 px-6 w-3/4 mx-auto">
          <PaintingFrame
            data={page.image.data}
            mimeType={page.image.mimeType}
            alt={`Impressionist painting for page ${page.pageNumber}`}
            pageNumber={page.pageNumber}
            storyTitle={storyTitle}
          />
        </div>

        {/* Prose */}
        <div className="max-w-2xl mx-auto px-6">
          <PoemText text={page.poem} animate={isLatest} />
        </div>
      </div>

      {/* Page number + divider */}
      <div className="flex flex-col items-center gap-4">
        <p className="font-sans text-xs text-ink-muted uppercase tracking-[0.3em]">
          {page.pageNumber}
        </p>
        <div className="w-16 h-px bg-ink-muted/20" />
      </div>
    </section>
  );
}
