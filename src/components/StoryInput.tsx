"use client";

import { useState } from "react";

interface StoryInputProps {
  onSubmit: (theme: string) => void;
  isGenerating: boolean;
}

export default function StoryInput({
  onSubmit,
  isGenerating,
}: StoryInputProps) {
  const [theme, setTheme] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (theme.trim() && !isGenerating) {
      onSubmit(theme.trim());
    }
  };

  const suggestions = [
    "a rainy evening in a Japanese garden",
    "the moment before a thunderstorm breaks",
    "sunlight through cathedral stained glass",
    "a tide pool at golden hour",
    "snow falling on a sleeping city",
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 relative">
      {/* Book-page vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(26, 26, 31, 0.05) 100%)',
        }}
      />
      <div className="max-w-2xl w-full text-center space-y-10 relative z-0">
        {/* Title */}
        <div className="space-y-4">
          {/* Luna icon — crescent moon cradling an open book */}
          <div className="flex justify-center mb-2">
            <svg
              width="72"
              height="72"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="animate-fade-in"
              aria-hidden="true"
            >
              {/* Crescent moon */}
              <path
                d="M52 36c0 12.15-9.85 22-22 22-3.87 0-7.51-1-10.66-2.76A22 22 0 0 0 56 36a22 22 0 0 0-36.66-16.24A21.85 21.85 0 0 1 30 18c12.15 0 22 8.06 22 18Z"
                fill="currentColor"
                className="text-ink-primary"
                opacity="0.08"
              />
              <path
                d="M30 14c-12.15 0-22 9.85-22 22s9.85 22 22 22c3.87 0 7.51-1 10.66-2.76A18 18 0 0 1 24 36a18 18 0 0 1 16.66-17.96A21.85 21.85 0 0 0 30 14Z"
                stroke="currentColor"
                className="text-ink-primary"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Open book in the crescent's embrace */}
              <path
                d="M26 38c3.5-2.5 5-5 5-5s1.5 2.5 5 5"
                stroke="currentColor"
                className="text-ink-muted"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Book spine */}
              <line
                x1="31" y1="33" x2="31" y2="41"
                stroke="currentColor"
                className="text-ink-muted"
                strokeWidth="1"
                strokeLinecap="round"
              />
              {/* Paintbrush flourish — a gentle arc sweeping from the book */}
              <path
                d="M33 35c4-1 8-3.5 12-8"
                stroke="currentColor"
                className="text-ink-primary"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.5"
              />
              <circle
                cx="46" cy="26"
                r="1.5"
                fill="currentColor"
                className="text-ink-primary"
                opacity="0.35"
              />
              {/* Tiny stars */}
              <circle cx="50" cy="18" r="1" fill="currentColor" className="text-ink-muted" opacity="0.4" />
              <circle cx="56" cy="24" r="0.7" fill="currentColor" className="text-ink-muted" opacity="0.3" />
              <circle cx="53" cy="32" r="0.8" fill="currentColor" className="text-ink-muted" opacity="0.25" />
            </svg>
          </div>
          <h1 className="font-serif text-7xl font-light text-ink-primary tracking-tight">
            Luna
          </h1>
          <div className="h-4" />
          <p className="font-sans text-lg text-ink-muted leading-relaxed max-w-md mx-auto">
            An interactive visual novel storybook.
            <br />
            Give Luna a theme, and she will paint your story.
          </p>
        </div>

        {/* Divider */}
        <div className="flex justify-center">
          <div className="w-24 h-px bg-canvas-linen" />
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Describe a scene, mood, or moment..."
              disabled={isGenerating}
              className="w-full px-6 py-4 bg-canvas-warm border border-canvas-linen rounded-none
                font-serif text-xl text-ink-primary placeholder:text-ink-muted/50
                focus:outline-none focus:border-ink-muted transition-colors
                disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!theme.trim() || isGenerating}
            className="px-8 py-3 font-sans text-sm tracking-widest uppercase
              text-canvas-cream bg-ink-primary
              hover:bg-ink-secondary transition-colors duration-300
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Begin
          </button>
        </form>

        {/* Divider */}
        <div className="flex justify-center">
          <div className="w-24 h-px bg-canvas-linen" />
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          <p className="font-sans text-xs text-ink-muted uppercase tracking-widest">
            Or try
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setTheme(s)}
                disabled={isGenerating}
                className="px-5 py-3 font-serif text-base text-ink-secondary
                  border border-canvas-linen hover:border-ink-muted
                  hover:text-ink-primary transition-colors
                  disabled:opacity-30"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
