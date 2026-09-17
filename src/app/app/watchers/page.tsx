"use client";
import { useState } from "react";
import Link from "next/link";
import { Radar, Plus, Play, Trash2, Bell, Check, ArrowRight } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Field } from "@/components/ui/Input";
import { StatusDot } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { useRoverState } from "@/rover/useRover";
import { getStore } from "@/rover/store";
import { evaluateWatcher, createWatcher, toggleWatcher, acknowledgeAlert, deleteWatcher } from "@/rover/watchers";
import { timeAgo } from "@/rover/format";
import type { WatcherSignal, WatcherTrigger } from "@/rover/types";
import { cn } from "@/lib/utils";

const allSignals: WatcherSignal[] = ["deadlines", "blockers", "requirements", "velocity", "risk"];
const allTriggers: WatcherTrigger[] = ["risk_increases", "deadline_changes", "new_blocker", "requirement_conflict"];
const triggerLabel: Record<WatcherTrigger, string> = {
  risk_increases: "Risk increases",
  deadline_changes: "Deadline changes",
  new_blocker: "New blocker appears",
  requirement_conflict: "Requirement conflict",
};

export default function WatchersPage() {
  const s = useRoverState();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [signals, setSignals] = useState<WatcherSignal[]>(["blockers", "risk"]);
  const [triggers, setTriggers] = useState<WatcherTrigger[]>(["new_blocker"]);
  const [autoLaunch, setAutoLaunch] = useState(false);

  const check = (id: string) => {
    const alerts = evaluateWatcher(getStore(), id);
    toast.push({ title: alerts.length ? `${alerts.length} alert(s) raised` : "No new alerts", tone: alerts.length ? "ai" : undefined });
  };
  const checkAll = () => {
    let total = 0;
    s.watchers.forEach((w) => { total += evaluateWatcher(getStore(), w.id).length; });
    toast.push({ title: total ? `${total} alert(s) across watchers` : "All clear", tone: total ? "ai" : undefined });
  };

  const submit = () => {
    createWatcher(getStore(), { name: name || "Untitled watcher", scopeKind: "workspace", scopeLabel: name || "Workspace", signals, triggers, autoLaunch, enabled: true });
    setOpen(false); setName(""); toast.push({ title: "Watcher created", tone: "ai" });
  };

  const toggle = <T,>(arr: T[], set: (v: T[]) => void, v: T) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <>
      <PageHeader
        title="Watchers"
        description="Persistent monitors that watch a scope and alert you — or launch a mission — when something changes."
        actions={<><Button variant="secondary" onClick={checkAll}><Play className="h-4 w-4" /> Check all</Button><Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New watcher</Button></>}
      />
      <PageBody>
        <div className="mx-auto max-w-3xl space-y-3">
          {s.watchers.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line bg-surface/50 p-8 text-center text-[13px] text-muted">
              <Radar className="mx-auto mb-2 h-6 w-6 text-accent" /> No watchers yet.
            </div>
          )}
          {s.watchers.map((w) => {
            const unack = w.alerts.filter((a) => !a.acknowledged);
            return (
              <div key={w.id} className="rounded-2xl border border-line bg-surface p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Radar className="h-4 w-4 text-accent" />
                      <h3 className="text-[15px] font-semibold text-ink">{w.name}</h3>
                      <span className="inline-flex items-center gap-1.5 text-[12px] text-muted"><StatusDot tone={w.enabled ? "success" : "muted"} /> {w.enabled ? "Active" : "Paused"}</span>
                      {w.autoLaunch && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">Auto-launch</span>}
                    </div>
                    <p className="mt-1 text-[12.5px] text-muted">Watching {w.scopeLabel} · {w.signals.join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => check(w.id)} className="rounded-md border border-line px-2 py-1 text-[12px] font-medium text-ink hover:border-accent/30" >Check now</button>
                    <button onClick={() => toggleWatcher(getStore(), w.id)} className="rounded-md p-1.5 text-muted hover:bg-ink/5" title="Toggle"><Play className="h-3.5 w-3.5" /></button>
                    <button onClick={() => { deleteWatcher(getStore(), w.id); toast.push({ title: "Watcher deleted" }); }} className="rounded-md p-1.5 text-muted hover:bg-error/10 hover:text-error" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {w.triggers.map((t) => (
                    <span key={t} className="rounded-full border border-line bg-canvas px-2 py-0.5 text-[11.5px] text-muted">{triggerLabel[t]}</span>
                  ))}
                </div>

                {w.alerts.length > 0 && (
                  <div className="mt-4 space-y-1.5 border-t border-line pt-3">
                    {w.alerts.slice(0, 5).map((a) => (
                      <div key={a.id} className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2", a.acknowledged ? "opacity-50" : a.severity === "critical" ? "bg-error/[0.06]" : a.severity === "warning" ? "bg-warning/[0.06]" : "bg-ink/[0.03]")}>
                        <Bell className={cn("h-3.5 w-3.5 shrink-0", a.severity === "critical" ? "text-error" : a.severity === "warning" ? "text-warning" : "text-muted")} />
                        <span className="min-w-0 flex-1 text-[12.5px] text-ink">{a.message}</span>
                        {a.launchedMissionId && <Link href={`/app/missions/${a.launchedMissionId}`} className="inline-flex items-center gap-0.5 text-[11.5px] text-accent">Mission <ArrowRight className="h-3 w-3" /></Link>}
                        <span className="shrink-0 text-[11px] text-muted">{timeAgo(a.at)}</span>
                        {!a.acknowledged && <button onClick={() => acknowledgeAlert(getStore(), w.id, a.id)} className="rounded p-0.5 text-muted hover:text-success" title="Acknowledge"><Check className="h-3.5 w-3.5" /></button>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PageBody>

      <Modal open={open} onClose={() => setOpen(false)} title="New watcher">
        <div className="space-y-4 p-5">
          <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Launch readiness" /></Field>
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-ink">Monitor</span>
            <div className="flex flex-wrap gap-1.5">
              {allSignals.map((sig) => (
                <button key={sig} onClick={() => toggle(signals, setSignals, sig)} className={cn("rounded-full border px-2.5 py-1 text-[12.5px] font-medium capitalize", signals.includes(sig) ? "border-accent/30 bg-accent/10 text-accent" : "border-line text-muted")}>{sig}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-ink">Trigger when</span>
            <div className="flex flex-wrap gap-1.5">
              {allTriggers.map((t) => (
                <button key={t} onClick={() => toggle(triggers, setTriggers, t)} className={cn("rounded-full border px-2.5 py-1 text-[12.5px] font-medium", triggers.includes(t) ? "border-accent/30 bg-accent/10 text-accent" : "border-line text-muted")}>{triggerLabel[t]}</button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-[13px] text-ink">
            <button onClick={() => setAutoLaunch((v) => !v)} className={cn("relative h-4 w-7 rounded-full transition-colors", autoLaunch ? "bg-accent" : "bg-ink/15")}>
              <span className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all", autoLaunch ? "left-[14px]" : "left-0.5")} />
            </button>
            Auto-launch a mission when triggered
          </label>
          <Button className="w-full" onClick={submit}>Create watcher</Button>
        </div>
      </Modal>
    </>
  );
}
