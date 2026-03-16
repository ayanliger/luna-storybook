"use client";

import { useState, useEffect } from "react";

interface PoemTextProps {
  text: string;
  animate?: boolean;
}

export default function PoemText({ text, animate = true }: PoemTextProps) {
  const [displayedLength, setDisplayedLength] = useState(animate ? 0 : text.length);
  const [isComplete, setIsComplete] = useState(!animate);

  useEffect(() => {
    if (!animate) {
      setDisplayedLength(text.length);
      setIsComplete(true);
      return;
    }

    setDisplayedLength(0);
    setIsComplete(false);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedLength(i);
      if (i >= text.length) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [text, animate]);

  return (
    <div className="font-serif text-lg md:text-xl text-ink-primary leading-[1.9] whitespace-pre-line">
      <span>{text.slice(0, displayedLength)}</span>
      {!isComplete && <span className="typewriter-cursor" />}
    </div>
  );
}
