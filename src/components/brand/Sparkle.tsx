import { cn } from "@/lib/utils";

/** The Rover AI ✦ mark used consistently to denote AI surfaces. */
export function Sparkle({
  className,
  size = 16,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-accent", className)}
      aria-hidden="true"
    >
      <path
        d="M12 1.5C12 6.5 15 10 22 12C15 14 12 17.5 12 22.5C12 17.5 9 14 2 12C9 10 12 6.5 12 1.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
