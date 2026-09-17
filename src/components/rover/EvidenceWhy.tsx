"use client";
import { useState } from "react";
import { HelpCircle, X, FileText, FolderKanban, CalendarDays, CheckSquare, Link2 } from "lucide-react";
import { Sparkle } from "@/components/brand/Sparkle";
import type { Evidence } from "@/rover/types";
import { cn } from "@/lib/utils";

const sourceIcon: Record<string, React.ElementType> = {
  document: FileText,
  project: FolderKanban,
  task: CheckSquare,
  meeting: CalendarDays,
};

/**
 * Reusable "Why?" affordance. Attach it to any AI claim/insight to reveal the
 * evidence chain behind it. If there's no evidence, it says so honestly rather
 * than implying certainty.
 */
export function EvidenceWhy({
  claim,
  evidence,
  label = "Why?",
  className,
}: {
  claim: string;
  evidence: Evidence[];
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span className={cn("relative inline-block", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-md border border-accent/25 bg-accent/[0.06] px-2 py-0.5 text-[12px] font-medium text-accent transition-colors hover:bg-accent/10"
      >
        <HelpCircle className="h-3.5 w-3.5" /> {label}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-line bg-surface p-4 shadow-float animate-scale-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
                <Sparkle size={12} /> Evidence
              </div>
              <button onClick={() => setOpen(false)} className="rounded p-0.5 text-muted hover:bg-ink/5" aria-label="Close">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="mt-2 text-[13px] font-medium text-ink">{claim}</p>

            {evidence.length === 0 ? (
              <p className="mt-3 rounded-lg bg-ink/[0.03] px-3 py-2 text-[12.5px] text-muted">
                No supporting evidence was recorded for this claim.
              </p>
            ) : (
              <div className="mt-3 space-y-1.5">
                {evidence.map((e) => {
                  const Icon = sourceIcon[e.sourceType] ?? Link2;
                  return (
                    <div key={e.id} className="flex items-start gap-2.5 rounded-lg border border-line px-2.5 py-2">
                      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12.5px] font-medium text-ink">{e.sourceLabel}</div>
                        {e.section && <div className="truncate text-[11.5px] text-muted">{e.section}</div>}
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className={cn(
                            "rounded px-1 py-px text-[10px] font-medium",
                            e.relationship === "contradicts" ? "bg-error/10 text-error"
                              : e.relationship === "context" ? "bg-ink/5 text-muted"
                              : "bg-success/10 text-success"
                          )}>{e.relationship}</span>
                          <span className="text-[10.5px] text-muted">{Math.round(e.confidence * 100)}% confidence</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </span>
  );
}
