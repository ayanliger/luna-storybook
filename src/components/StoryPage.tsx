"use client";

import PoemText from "./PoemText";
import PaintingFrame from "./PaintingFrame";
import AudioPlayer from "./AudioPlayer";
import { StoryPage as StoryPageType } from "@/lib/types";

interface StoryPageProps {
  page: StoryPageType;
  isLatest: boolean;
  audio?: { data: string; mimeType: string };
}

export default function StoryPage({ page, isLatest, audio }: StoryPageProps) {
  return (
    <section
      className="animate-slide-up"
      style={{ animationDelay: `${(page.pageNumber - 1) * 0.15}s` }}
    >
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Page number */}
        <p className="font-sans text-xs text-ink-muted uppercase tracking-[0.3em] mb-8 text-center">
          {page.pageNumber}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Painting */}
          <div className="animate-fade-in order-1">
            <PaintingFrame
              data={page.image.data}
              mimeType={page.image.mimeType}
              alt={`Impressionist painting for stanza ${page.pageNumber}`}
            />
          </div>

          {/* Poem + Audio */}
          <div className="space-y-8 order-2">
            <PoemText text={page.poem} animate={isLatest} />
            {audio && <AudioPlayer data={audio.data} mimeType={audio.mimeType} />}
          </div>
        </div>
      </div>

      {/* Subtle divider */}
      <div className="flex justify-center">
        <div className="w-16 h-px bg-ink-muted/20" />
      </div>
    </section>
  );
}
