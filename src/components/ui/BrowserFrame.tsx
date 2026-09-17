import { cn } from "@/lib/utils";

/** A subtle window chrome used to frame product mockups. */
export function BrowserFrame({
  children,
  className,
  url = "app.rover.ai",
  tone = "light",
}: {
  children: React.ReactNode;
  className?: string;
  url?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border shadow-float",
        tone === "light"
          ? "border-line bg-surface"
          : "border-night-line bg-night-surface",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 border-b px-4 py-2.5",
          tone === "light" ? "border-line bg-canvas" : "border-night-line bg-night"
        )}
      >
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#E5484D]/70" />
          <span className="h-3 w-3 rounded-full bg-[#E6A700]/70" />
          <span className="h-3 w-3 rounded-full bg-[#22A06B]/70" />
        </div>
        <div
          className={cn(
            "mx-auto flex h-6 max-w-xs flex-1 items-center justify-center rounded-md px-3 text-[11px]",
            tone === "light"
              ? "bg-surface text-muted border border-line"
              : "bg-night text-night-muted border border-night-line"
          )}
        >
          {url}
        </div>
        <div className="w-[54px]" />
      </div>
      {children}
    </div>
  );
}
