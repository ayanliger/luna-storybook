"use client";

interface LoadingStateProps {
  message: string;
}

export default function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      {/* Impressionist paint dots animation */}
      <div className="relative w-32 h-32">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute rounded-full animate-gentle-pulse"
            style={{
              width: `${20 + i * 8}px`,
              height: `${20 + i * 8}px`,
              left: `${50 - (20 + i * 8) / 2 + Math.cos((i * 72 * Math.PI) / 180) * 30}px`,
              top: `${50 - (20 + i * 8) / 2 + Math.sin((i * 72 * Math.PI) / 180) * 30}px`,
              backgroundColor: [
                "#1A1A1F",
                "#4A4A52",
                "#8A8A94",
                "#6E6E78",
                "#B0B0B8",
              ][i],
              animationDelay: `${i * 0.4}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      <p className="font-serif text-2xl text-ink-secondary italic tracking-wide animate-gentle-pulse">
        {message}
      </p>
    </div>
  );
}
