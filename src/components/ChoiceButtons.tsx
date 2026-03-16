"use client";

import { useState } from "react";

const MAX_LENGTH = 120;

function sanitize(input: string): string {
  // Strip HTML tags, control characters, and excessive whitespace
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface ChoiceButtonsProps {
  options: { label: string; theme: string }[];
  onSelect: (theme: string) => void;
  disabled?: boolean;
}

export default function ChoiceButtons({
  options,
  onSelect,
  disabled,
}: ChoiceButtonsProps) {
  const [customDirection, setCustomDirection] = useState("");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = sanitize(customDirection);
    if (cleaned && !disabled) {
      onSelect(cleaned);
      setCustomDirection("");
    }
  };

  return (
    <div className="space-y-6 text-center py-12">
      <p className="font-sans text-xs text-ink-muted uppercase tracking-widest">
        Where does the story go next?
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {options.map((option) => (
          <button
            key={option.label}
            onClick={() => onSelect(option.theme)}
            disabled={disabled}
            className="px-6 py-3 font-serif text-lg text-ink-primary
              border border-ink-muted/30 hover:border-ink-muted
              hover:text-ink-primary transition-all duration-300
              hover:shadow-[0_2px_20px_rgba(26,26,31,0.08)]
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Custom direction input */}
      <div className="pt-4">
        <p className="font-sans text-xs text-ink-muted uppercase tracking-widest mb-3">
          Or write your own
        </p>
        <form onSubmit={handleCustomSubmit} className="flex justify-center gap-3 max-w-lg mx-auto">
          <input
            type="text"
            value={customDirection}
            onChange={(e) => setCustomDirection(e.target.value.slice(0, MAX_LENGTH))}
            placeholder="Take the story somewhere new..."
            disabled={disabled}
            maxLength={MAX_LENGTH}
            className="flex-1 px-4 py-3 bg-canvas-warm border border-canvas-linen rounded-none
              font-serif text-base text-ink-primary placeholder:text-ink-muted/50
              focus:outline-none focus:border-ink-muted transition-colors
              disabled:opacity-30"
          />
          <button
            type="submit"
            disabled={!sanitize(customDirection) || disabled}
            className="px-5 py-3 font-sans text-xs tracking-widest uppercase
              text-canvas-cream bg-ink-primary
              hover:bg-ink-secondary transition-colors duration-300
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Go
          </button>
        </form>
        <p className="font-sans text-[10px] text-ink-muted/50 mt-2">
          {customDirection.length}/{MAX_LENGTH}
        </p>
      </div>
    </div>
  );
}
