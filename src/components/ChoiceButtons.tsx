"use client";

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
              border border-ink-muted/30 hover:border-accent-gold
              hover:text-accent-gold transition-all duration-300
              hover:shadow-[0_2px_20px_rgba(184,150,62,0.15)]
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
