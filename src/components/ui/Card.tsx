import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  className,
  children,
  tone = "neutral",
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "neutral" | "ai" | "success" | "warning" | "error";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-ink/[0.04] text-muted border-line",
    ai: "bg-accent/10 text-accent border-accent/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-[#8a6600] border-warning/20",
    error: "bg-error/10 text-error border-error/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({
  tone = "success",
  className,
  pulse = false,
}: {
  tone?: "success" | "warning" | "error" | "ai" | "muted";
  className?: string;
  pulse?: boolean;
}) {
  const colors: Record<string, string> = {
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
    ai: "bg-accent",
    muted: "bg-muted",
  };
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        colors[tone],
        pulse && "animate-pulse-dot",
        className
      )}
    />
  );
}
