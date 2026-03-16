"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface AudioPlayerProps {
  data: string;
  mimeType: string;
  startPage: number;
  endPage: number;
}

export default function AudioPlayer({ data, mimeType, startPage, endPage }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePage, setActivePage] = useState<number | null>(null);
  const totalPages = endPage - startPage + 1;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setIsPlaying(false);
      setActivePage(null);
    };
    const onTimeUpdate = () => {
      if (!audio.duration) return;
      const progress = audio.currentTime / audio.duration;
      const currentPage = Math.min(
        startPage + Math.floor(progress * totalPages),
        endPage
      );
      setActivePage(currentPage);
    };
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [startPage, endPage, totalPages]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekToPage = useCallback((pageNum: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const pageIndex = pageNum - startPage;
    audio.currentTime = (pageIndex / totalPages) * audio.duration;
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  }, [startPage, totalPages, isPlaying]);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => startPage + i);

  return (
    <div className="flex flex-col items-center gap-3">
      <audio ref={audioRef} src={`data:${mimeType};base64,${data}`} />

      {/* Main play/pause button */}
      <button
        onClick={toggle}
        className="flex items-center gap-2 px-4 py-2 font-sans text-xs tracking-widest uppercase
          text-ink-secondary border border-canvas-linen hover:border-accent-gold
          hover:text-accent-gold transition-colors"
        aria-label={isPlaying ? "Pause narration" : `Listen to pages ${startPage}–${endPage}`}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="2" y="1" width="3.5" height="12" rx="0.5" />
            <rect x="8.5" y="1" width="3.5" height="12" rx="0.5" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M3 1.5v11l9-5.5z" />
          </svg>
        )}
        <span>{isPlaying ? "Pause" : `Listen · pages ${startPage}–${endPage}`}</span>
      </button>

      {/* Per-page seek buttons */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((num) => (
          <button
            key={num}
            onClick={() => seekToPage(num)}
            className={`w-7 h-7 rounded-full font-sans text-[10px] transition-colors
              ${activePage === num
                ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/40"
                : "text-ink-muted hover:text-accent-gold hover:bg-accent-gold/10 border border-transparent"
              }`}
            aria-label={`Jump to page ${num}`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
