"use client";
import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  active,
  onChange,
  className,
  size = "md",
}: {
  tabs: { id: string; label: React.ReactNode; icon?: React.ReactNode }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-line bg-surface p-1",
        className
      )}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md font-medium transition-all",
            size === "sm" ? "h-7 px-2.5 text-[13px]" : "h-8 px-3 text-sm",
            active === t.id
              ? "bg-ink text-white shadow-sm"
              : "text-muted hover:text-ink hover:bg-ink/5"
          )}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}
