"use client";

import { useState } from "react";

interface PaintingFrameProps {
  data: string;
  mimeType: string;
  alt: string;
  pageNumber?: number;
  storyTitle?: string;
}

export default function PaintingFrame({
  data,
  mimeType,
  alt,
  pageNumber,
  storyTitle,
}: PaintingFrameProps) {
  const [loaded, setLoaded] = useState(false);

  const handleDownload = () => {
    const ext = mimeType.split("/")[1] || "png";
    const slug = (storyTitle || "luna")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const link = document.createElement("a");
    link.href = `data:${mimeType};base64,${data}`;
    link.download = `${slug}-page-${pageNumber ?? "image"}.${ext}`;
    link.click();
  };

  return (
    <div className="group relative">
      {/* Gallery frame effect */}
      <div
        className="p-0 shadow-[0_10px_30px_-4px_rgba(26,26,31,0.25)]"
      >
        <div className="border border-ink-muted/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:${mimeType};base64,${data}`}
            alt={alt}
            onLoad={() => setLoaded(true)}
            className={`w-full h-auto block transition-opacity duration-1000 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </div>

      {/* Download button — appears on hover */}
      {loaded && (
        <button
          onClick={handleDownload}
          title="Download painting"
          className="absolute top-3 right-3 p-2 rounded-full
            bg-canvas-cream/70 backdrop-blur-sm
            text-ink-muted opacity-0 group-hover:opacity-100
            hover:text-ink-primary hover:bg-canvas-cream/90
            transition-all duration-300 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 1v9M4 7l3 3 3-3M2 12h10" />
          </svg>
        </button>
      )}
    </div>
  );
}
