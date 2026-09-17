import { cn } from "@/lib/utils";

/**
 * Rover AI mark — an abstract geometric "R".
 * The stem + bowl read as an "R", while the diagonal leg extends into an
 * arrow/compass needle to suggest exploration, navigation and movement.
 * A small node caps the leg to hint at "connection".
 */
export function RoverMark({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rover-grad" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#635BFF" />
          <stop offset="1" stopColor="#8B7CFF" />
        </linearGradient>
      </defs>
      {/* stem */}
      <path
        d="M8 5.5C8 4.67 8.67 4 9.5 4S11 4.67 11 5.5V26.5C11 27.33 10.33 28 9.5 28S8 27.33 8 26.5V5.5Z"
        fill="currentColor"
      />
      {/* bowl */}
      <path
        d="M9.5 4H16.5C20.09 4 23 6.91 23 10.5C23 14.09 20.09 17 16.5 17H9.5V13.5H16.5C18.16 13.5 19.5 12.16 19.5 10.5C19.5 8.84 18.16 7.5 16.5 7.5H9.5V4Z"
        fill="currentColor"
      />
      {/* leg extending into a directional needle */}
      <path
        d="M14.2 15.6L27.4 27.2C28.03 27.75 28.06 28.73 27.46 29.32C26.93 29.85 26.08 29.9 25.49 29.44L12.1 18.9L14.2 15.6Z"
        fill="url(#rover-grad)"
      />
      {/* connection node */}
      <circle cx="26.5" cy="6.5" r="2.6" fill="url(#rover-grad)" />
    </svg>
  );
}

export function Logo({
  className,
  tone = "dark",
  size = 26,
  showWordmark = true,
}: {
  className?: string;
  /** "dark" = dark text (for light bg), "light" = light text (for dark bg) */
  tone?: "dark" | "light";
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <RoverMark
        size={size}
        className={tone === "dark" ? "text-ink" : "text-white"}
      />
      {showWordmark && (
        <span className="inline-flex items-baseline gap-1">
          <span
            className={cn(
              "font-semibold tracking-tight leading-none",
              tone === "dark" ? "text-ink" : "text-white"
            )}
            style={{ fontSize: size * 0.72 }}
          >
            rover
          </span>
          <span
            className="font-semibold leading-none text-accent"
            style={{ fontSize: size * 0.5 }}
          >
            AI
          </span>
        </span>
      )}
    </span>
  );
}
