"use client";

import PoemText from "./PoemText";
import PaintingFrame from "./PaintingFrame";
import { StoryPage as StoryPageType } from "@/lib/types";

interface StoryPageProps {
  page: StoryPageType;
  isLatest: boolean;
}

export default function StoryPage({ page, isLatest }: StoryPageProps) {
  return (
    <section
      className="animate-slide-up"
      style={{ animationDelay: `${(page.pageNumber - 1) * 0.15}s` }}
    >
      <div className="py-12 md:py-20">
        {/* Page number */}
        <p className="font-sans text-xs text-ink-muted uppercase tracking-[0.3em] mb-8 text-center">
          {page.pageNumber}
        </p>

        {/* Painting */}
        <div className="animate-fade-in mb-10 md:mb-14 px-6 w-3/4 mx-auto">
          <PaintingFrame
            data={page.image.data}
            mimeType={page.image.mimeType}
            alt={`Impressionist painting for page ${page.pageNumber}`}
          />
        </div>

        {/* Prose */}
        <div className="max-w-2xl mx-auto px-6">
          <PoemText text={page.poem} animate={isLatest} />
        </div>
      </div>

      {/* Subtle divider */}
      <div className="flex justify-center">
        <div className="w-16 h-px bg-ink-muted/20" />
      </div>
    </section>
  );
}
