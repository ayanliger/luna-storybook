"use client";

import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  data: string;
  mimeType: string;
}

export default function AudioPlayer({ data, mimeType }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

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

  return (
    <div className="flex items-center gap-3">
      <audio ref={audioRef} src={`data:${mimeType};base64,${data}`} />
      <button
        onClick={toggle}
        className="flex items-center gap-2 px-4 py-2 font-sans text-xs tracking-widest uppercase
          text-ink-secondary border border-canvas-linen hover:border-accent-gold
          hover:text-accent-gold transition-colors"
        aria-label={isPlaying ? "Pause narration" : "Listen to narration"}
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
        <span>{isPlaying ? "Pause" : "Listen"}</span>
      </button>
    </div>
  );
}
