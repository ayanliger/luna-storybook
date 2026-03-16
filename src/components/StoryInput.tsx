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
          {/* Luna icon — crescent moon */}
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
              <path
                d="M30 14c-12.15 0-22 9.85-22 22s9.85 22 22 22c3.87 0 7.51-1 10.66-2.76A18 18 0 0 1 24 36a18 18 0 0 1 16.66-17.96A21.85 21.85 0 0 0 30 14Z"
                stroke="currentColor"
                className="text-ink-primary"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
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
