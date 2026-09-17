"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ToolRiskChip } from "./status";
import { getStore } from "@/rover/store";
import { applyChange, rejectChange, applyAll, rejectAll } from "@/rover/sandbox";
import { getOrchestrator } from "@/rover/orchestrator";
import { useToast } from "@/components/ui/Toast";
import type { SandboxChange } from "@/rover/types";
import { cn } from "@/lib/utils";

const opMeta = {
  create: { icon: Plus, tone: "text-success", label: "add" },
  update: { icon: Pencil, tone: "text-warning", label: "update" },
  delete: { icon: Trash2, tone: "text-error", label: "delete" },
};

/**
 * Sandbox diff: shows staged changes (never applied to live data yet) with
 * per-change and bulk Apply / Reject. Every change is attributed to its run.
 */
export function SandboxDiff({ changes, missionId }: { changes: SandboxChange[]; missionId?: string }) {
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set(changes.filter((c) => c.status === "staged").map((c) => c.id)));

  const staged = changes.filter((c) => c.status === "staged");
  const adds = staged.filter((c) => c.op === "create").length;
  const updates = staged.filter((c) => c.op === "update").length;
  const deletes = staged.filter((c) => c.op === "delete").length;

  const toggle = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const finish = () => {
    // if nothing left staged, resume verification on the mission
    if (missionId && getStore().getState().sandbox.filter((c) => c.missionId === missionId && c.status === "staged").length === 0) {
      getOrchestrator().resumeMission(missionId);
    }
  };

  const applySelected = () => {
    let n = 0;
    selected.forEach((id) => { if (applyChange(getStore(), id)) n++; });
    toast.push({ title: `Applied ${n} change${n !== 1 ? "s" : ""}`, tone: "ai" });
    finish();
  };
  const applyEverything = () => { const n = applyAll(getStore(), missionId); toast.push({ title: `Applied all ${n} changes`, tone: "ai" }); finish(); };
  const rejectEverything = () => { const n = rejectAll(getStore(), missionId); toast.push({ title: `Rejected ${n} changes` }); finish(); };

  if (staged.length === 0) {
    return (
      <div className="text-[13px] text-muted">
        No staged changes. {changes.length > 0 && `${changes.filter((c) => c.status === "applied").length} applied, ${changes.filter((c) => c.status === "rejected").length} rejected.`}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[12.5px]">
        <span className="inline-flex items-center gap-1 font-medium text-success">+{adds} added</span>
        <span className="inline-flex items-center gap-1 font-medium text-warning">~{updates} updated</span>
        <span className="inline-flex items-center gap-1 font-medium text-error">-{deletes} deleted</span>
      </div>

      <div className="space-y-1.5">
        {staged.map((c) => {
          const meta = opMeta[c.op];
          const Icon = meta.icon;
          const on = selected.has(c.id);
          return (
            <div key={c.id} className={cn("flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors", on ? "border-accent/30 bg-accent/[0.03]" : "border-line")}>
              <button onClick={() => toggle(c.id)} className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded border", on ? "border-accent bg-accent text-white" : "border-line")}>
                {on && <Check className="h-3 w-3" strokeWidth={3} />}
              </button>
              <Icon className={cn("h-4 w-4 shrink-0", meta.tone)} />
              <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{c.label}</span>
              <span className="shrink-0 text-[11px] text-muted">{c.agentName}</span>
              <ToolRiskChip risk={c.risk} />
              <div className="flex shrink-0 gap-1">
                <button onClick={() => { applyChange(getStore(), c.id); toast.push({ title: "Change applied", tone: "ai" }); finish(); }} className="rounded p-1 text-success hover:bg-success/10" aria-label="Apply"><Check className="h-3.5 w-3.5" /></button>
                <button onClick={() => { rejectChange(getStore(), c.id); toast.push({ title: "Change rejected" }); finish(); }} className="rounded p-1 text-error hover:bg-error/10" aria-label="Reject"><X className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={applyEverything}><Check className="h-4 w-4" /> Apply all</Button>
        <Button size="sm" variant="secondary" onClick={applySelected} disabled={selected.size === 0}>Apply selected ({selected.size})</Button>
        <Button size="sm" variant="ghost" onClick={rejectEverything} className="text-error hover:bg-error/5"><X className="h-4 w-4" /> Reject all</Button>
      </div>
    </div>
  );
}

export function SandboxBanner() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/[0.06] px-2.5 py-0.5 text-[12px] font-medium text-accent">
      <FlaskConical className="h-3.5 w-3.5" /> Sandbox
    </span>
  );
}
