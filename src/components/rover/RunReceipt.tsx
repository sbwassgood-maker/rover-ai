"use client";
import { useState } from "react";
import { Check, X, Undo2, FileText, Wrench, ShieldCheck, ChevronRight } from "lucide-react";
import { Sparkle } from "@/components/brand/Sparkle";
import { RunStatusBadge, ToolRiskChip } from "./status";
import { formatDuration, timeAgo } from "@/rover/format";
import { getOrchestrator } from "@/rover/orchestrator";
import { useToast } from "@/components/ui/Toast";
import type { RoverState, AgentRun } from "@/rover/types";
import { cn } from "@/lib/utils";

/** A full "Agent Receipt": what the run did, tool calls, evidence, verification, undo. */
export function RunReceipt({ run, state }: { run: AgentRun; state: RoverState }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const calls = state.toolCalls.filter((c) => c.runId === run.id);
  const okCalls = calls.filter((c) => c.status === "ok");
  const artifacts = state.artifacts.filter((a) => a.runId === run.id);
  const verification = state.verifications.find((v) => v.id === run.verificationId);
  const messages = state.messages.filter((m) => m.runId === run.id).slice().reverse();
  const reverted = calls.some((c) => c.status === "reverted");
  const canUndo = okCalls.some((c) => c.undo && c.undo.length) && !reverted;

  const undo = () => {
    const n = getOrchestrator().undoRun(run.id);
    toast.push({ title: "Agent run undone", description: `${n} change(s) reverted.`, tone: "ai" });
  };

  return (
    <div className="rounded-xl border border-line bg-surface">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 p-4 text-left">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10"><Sparkle size={14} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-semibold text-ink">{run.agentName}</span>
            <RunStatusBadge status={run.status} />
          </div>
          <div className="truncate text-[12.5px] text-muted">{run.goal}</div>
        </div>
        <span className="hidden shrink-0 text-[11.5px] text-muted sm:block">{formatDuration(run.durationMs)}</span>
        <ChevronRight className={cn("h-4 w-4 shrink-0 text-muted transition-transform", open && "rotate-90")} />
      </button>

      {open && (
        <div className="border-t border-line px-4 py-4 animate-fade-in">
          {/* Receipt summary */}
          <div className="rounded-lg border border-line bg-canvas/50 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
              <Sparkle size={12} /> Rover receipt
            </div>
            <ul className="space-y-1 text-[13px] text-ink/85">
              <li className="flex items-center gap-2"><Wrench className="h-3.5 w-3.5 text-muted" /> {okCalls.length} tool call{okCalls.length !== 1 ? "s" : ""} executed</li>
              <li className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted" /> {artifacts.length} artifact{artifacts.length !== 1 ? "s" : ""} produced</li>
              {verification && (
                <li className="flex items-center gap-2">
                  {verification.passed ? <Check className="h-3.5 w-3.5 text-success" /> : <X className="h-3.5 w-3.5 text-error" />}
                  {verification.summary}
                </li>
              )}
            </ul>
            {canUndo && (
              <button onClick={undo} className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12.5px] font-medium text-ink hover:border-error/40 hover:text-error">
                <Undo2 className="h-3.5 w-3.5" /> Undo this run
              </button>
            )}
            {reverted && <div className="mt-3 text-[12px] text-muted">This run&rsquo;s changes were reverted.</div>}
          </div>

          {/* Tool calls */}
          <div className="mt-4">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Tool calls</div>
            <div className="space-y-1.5">
              {calls.map((c) => (
                <div key={c.id} className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2">
                  <ToolRiskChip risk={c.risk} />
                  <span className="font-mono text-[12px] text-ink">{c.tool}</span>
                  <span className="flex-1" />
                  {c.status === "ok" && <span className="inline-flex items-center gap-1 text-[11.5px] text-success"><Check className="h-3 w-3" /> ok</span>}
                  {c.status === "awaiting_approval" && <span className="text-[11.5px] text-[#8a6600]">awaiting approval</span>}
                  {c.status === "blocked" && <span className="text-[11.5px] text-error">blocked</span>}
                  {c.status === "reverted" && <span className="text-[11.5px] text-muted">reverted</span>}
                  {c.status === "error" && <span className="text-[11.5px] text-error">error</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Verification detail */}
          {verification && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted"><ShieldCheck className="h-3.5 w-3.5" /> Verification</div>
              <div className="space-y-1.5">
                {verification.checks.map((chk, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg border border-line px-3 py-2 text-[12.5px]">
                    {chk.passed ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> : <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-error" />}
                    <span><span className="text-ink">{chk.criterion}</span><span className="block text-[11.5px] text-muted">{chk.reason}</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Run log */}
          <div className="mt-4">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Run log</div>
            <div className="space-y-1">
              {messages.map((m) => (
                <div key={m.id} className="flex items-baseline gap-2 text-[12px]">
                  <span className={cn(
                    "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                    m.role === "verifier" ? "bg-accent/10 text-accent"
                      : m.role === "tool" ? "bg-success/10 text-success"
                      : m.role === "system" ? "bg-warning/10 text-[#8a6600]"
                      : "bg-ink/5 text-muted"
                  )}>{m.role}</span>
                  <span className="text-ink/80">{m.text}</span>
                  <span className="ml-auto shrink-0 text-[10.5px] text-muted">{timeAgo(m.at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
