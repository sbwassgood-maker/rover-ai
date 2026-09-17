"use client";
import { useEffect, useRef, useState } from "react";

/** Types out text once it scrolls into view. */
export function Typewriter({
  text,
  speed = 18,
  start = true,
  className,
  onDone,
}: {
  text: string;
  speed?: number;
  start?: boolean;
  className?: string;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    if (!start) return;
    idx.current = 0;
    setShown("");
    setDone(false);
    const id = setInterval(() => {
      idx.current += 1;
      setShown(text.slice(0, idx.current));
      if (idx.current >= text.length) {
        clearInterval(id);
        setDone(true);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, start, speed]);

  return (
    <span className={className}>
      {shown}
      {!done && start && (
        <span className="ml-0.5 inline-block h-[1em] w-[2px] -translate-y-[1px] bg-accent align-middle animate-blink" />
      )}
    </span>
  );
}

/** Three-dot "thinking" indicator. */
export function ThinkingDots({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="inline-flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-accent"
            style={{
              animation: "pulse-dot 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </span>
    </span>
  );
}
