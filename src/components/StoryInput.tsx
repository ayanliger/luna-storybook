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
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="max-w-2xl w-full text-center space-y-10">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="font-serif text-7xl font-light text-ink-primary tracking-tight">
            Luna
          </h1>
          <p className="font-sans text-lg text-ink-muted leading-relaxed max-w-md mx-auto">
            An impressionist poetry storybook.
            <br />
            Give Luna a theme, and she will paint it into verse.
          </p>
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
                focus:outline-none focus:border-accent-gold transition-colors
                disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!theme.trim() || isGenerating}
            className="px-8 py-3 font-sans text-sm tracking-widest uppercase
              text-canvas-cream bg-ink-primary
              hover:bg-accent-gold transition-colors duration-300
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Begin
          </button>
        </form>

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
                className="px-4 py-2 font-serif text-sm text-ink-secondary
                  border border-canvas-linen hover:border-accent-gold
                  hover:text-accent-gold transition-colors
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
