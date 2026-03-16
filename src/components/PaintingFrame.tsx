"use client";

import { useState } from "react";

interface PaintingFrameProps {
  data: string;
  mimeType: string;
  alt: string;
}

export default function PaintingFrame({
  data,
  mimeType,
  alt,
}: PaintingFrameProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative">
      {/* Gallery frame effect */}
      <div
        className="p-2 md:p-3 bg-canvas-linen shadow-[0_4px_30px_rgba(44,40,37,0.12)]"
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
    </div>
  );
}
