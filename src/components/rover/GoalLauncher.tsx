"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Loader2 } from "lucide-react";
import { Sparkle } from "@/components/brand/Sparkle";
import { getOrchestrator } from "@/rover/orchestrator";
import { cn } from "@/lib/utils";

const examples = [
  "Launch our product",
  "Prepare for our board meeting",
  "Analyze our sales pipeline",
  "Find what's blocking the team",
  "Research this market",
  "Build a hiring plan",
];

/**
 * The command-center input. Submitting a goal creates a real Mission
 * (intent extraction + plan), kicks off execution, then navigates to the
 * mission detail page where the loop plays out.
 */
export function GoalLauncher({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [busy, setBusy] = useState(false);
  const [sandbox, setSandbox] = useState(false);

  const launch = (raw: string) => {
    const g = raw.trim();
    if (!g || busy) return;
    setBusy(true);
    const orch = getOrchestrator();
    const mission = orch.createMission({ rawGoal: g, sandbox });
    // Let the "Planning" state render, then execute the loop.
    setTimeout(() => {
      orch.runMission(mission.id);
      router.push(`/app/missions/${mission.id}`);
    }, 400);
  };

  return (
    <div className={cn("w-full", !compact && "mx-auto max-w-2xl")}>
      <form
        onSubmit={(e) => { e.preventDefault(); launch(goal); }}
        className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-2.5 shadow-sm transition-shadow focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/10"
      >
        <Sparkle size={compact ? 16 : 18} className="mb-2 ml-1.5" />
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); launch(goal); } }}
          rows={1}
          placeholder="What are you trying to accomplish?"
          className="max-h-40 flex-1 resize-none bg-transparent py-2 text-[15px] text-ink outline-none placeholder:text-muted/70"
          disabled={busy}
        />
        <div className="flex flex-col items-end gap-1.5">
          <button
            type="submit"
            disabled={!goal.trim() || busy}
            className={cn(
              "flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-[14px] font-medium transition-colors",
              goal.trim() && !busy ? "bg-accent text-white hover:bg-accent-hover" : "bg-ink/[0.06] text-muted"
            )}
          >
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Starting</> : <>Start mission <ArrowUp className="h-4 w-4" /></>}
          </button>
        </div>
      </form>

      {/* Sandbox toggle — stage changes for review before applying */}
      <label className="mt-2 flex items-center justify-end gap-2 pr-1 text-[12.5px] text-muted">
        <button
          type="button"
          onClick={() => setSandbox((v) => !v)}
          className={cn("relative h-4 w-7 rounded-full transition-colors", sandbox ? "bg-accent" : "bg-ink/15")}
          aria-label="Toggle sandbox mode"
        >
          <span className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all", sandbox ? "left-[14px]" : "left-0.5")} />
        </button>
        Sandbox mode {sandbox ? "on — changes staged for review" : "off — changes applied directly"}
      </label>

      {!compact && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => launch(ex)}
              disabled={busy}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-accent/30 hover:text-ink disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
