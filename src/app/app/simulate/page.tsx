"use client";
import { useMemo, useState } from "react";
import {
  FlaskConical, Play, AlertTriangle, GitFork, Clock, XCircle, MinusCircle, UserPlus, Ban, Info,
} from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/Button";
import { useRoverState } from "@/rover/useRover";
import { simulate, simulationTargets, type SimulationInput } from "@/rover/simulate";
import type { Simulation, SimulationKind } from "@/rover/types";
import { cn } from "@/lib/utils";

const kinds: { id: SimulationKind; label: string; icon: React.ElementType; needsTarget: boolean }[] = [
  { id: "delay_deadline", label: "Delay a deadline", icon: Clock, needsTarget: true },
  { id: "cancel_project", label: "Cancel a project", icon: XCircle, needsTarget: true },
  { id: "remove_feature", label: "Remove a feature", icon: MinusCircle, needsTarget: true },
  { id: "add_capacity", label: "Add engineers", icon: UserPlus, needsTarget: false },
  { id: "do_nothing", label: "Do nothing (counterfactual)", icon: Ban, needsTarget: false },
];

const sevMeta = {
  info: { tone: "text-muted", bg: "bg-ink/[0.03]", icon: Info },
  warning: { tone: "text-warning", bg: "bg-warning/[0.06]", icon: AlertTriangle },
  critical: { tone: "text-error", bg: "bg-error/[0.06]", icon: AlertTriangle },
};

export default function SimulatePage() {
  const s = useRoverState();
  const targets = useMemo(() => simulationTargets(s), [s]);
  const [kind, setKind] = useState<SimulationKind>("delay_deadline");
  const [targetId, setTargetId] = useState<string>(targets[0]?.id ?? "");
  const [days, setDays] = useState(14);
  const [people, setPeople] = useState(2);
  const [result, setResult] = useState<Simulation | null>(null);

  const needsTarget = kinds.find((k) => k.id === kind)!.needsTarget;

  const run = () => {
    const input: SimulationInput = { kind, targetId: needsTarget ? targetId : undefined, days, people };
    setResult(simulate(s, input));
  };

  return (
    <>
      <PageHeader
        title="Simulation"
        description="Project the impact of a change before you make it. Nothing here touches your live workspace."
      />
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          {/* Controls */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
              <h2 className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-ink"><GitFork className="h-4 w-4 text-accent" /> What if…</h2>
              <div className="space-y-1.5">
                {kinds.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => { setKind(k.id); setResult(null); }}
                    className={cn("flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-[13.5px] transition-colors", kind === k.id ? "border-accent/40 bg-accent/[0.05] text-ink" : "border-line text-muted hover:text-ink")}
                  >
                    <k.icon className={cn("h-4 w-4", kind === k.id ? "text-accent" : "")} /> {k.label}
                  </button>
                ))}
              </div>

              {needsTarget && (
                <div className="mt-3">
                  <label className="mb-1 block text-[12px] font-medium text-muted">Target</label>
                  <select value={targetId} onChange={(e) => { setTargetId(e.target.value); setResult(null); }} className="h-9 w-full rounded-lg border border-line bg-surface px-2 text-[13.5px] text-ink outline-none focus:border-accent/40">
                    {targets.map((t) => <option key={t.id} value={t.id}>{t.label} ({t.kind})</option>)}
                  </select>
                </div>
              )}
              {kind === "delay_deadline" && (
                <div className="mt-3">
                  <label className="mb-1 block text-[12px] font-medium text-muted">Delay (days): {days}</label>
                  <input type="range" min={1} max={60} value={days} onChange={(e) => { setDays(+e.target.value); setResult(null); }} className="w-full accent-accent" />
                </div>
              )}
              {kind === "add_capacity" && (
                <div className="mt-3">
                  <label className="mb-1 block text-[12px] font-medium text-muted">Engineers: {people}</label>
                  <input type="range" min={1} max={8} value={people} onChange={(e) => { setPeople(+e.target.value); setResult(null); }} className="w-full accent-accent" />
                </div>
              )}

              <Button className="mt-4 w-full" onClick={run}><Play className="h-4 w-4" /> Run simulation</Button>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-line bg-canvas/50 p-3 text-[12px] text-muted">
              <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              Simulations are projections based on the work graph, not guarantees. No data is modified.
            </div>
          </div>

          {/* Result */}
          <div>
            {!result ? (
              <div className="flex h-full min-h-64 items-center justify-center rounded-2xl border border-dashed border-line bg-surface/50 text-center text-[13px] text-muted">
                Pick a scenario and run it to see the projected impact.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/[0.05] to-transparent p-5">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-accent"><FlaskConical className="h-3.5 w-3.5" /> Simulation</div>
                  <h2 className="mt-1.5 text-lg font-semibold text-ink">{result.change}</h2>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink/85">{result.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Metric label="Affected" value={result.affected.length} />
                    <Metric label="Conflicts" value={result.conflicts.length} tone={result.conflicts.length ? "warning" : "default"} />
                    <Metric label="Risks" value={result.risks.length} tone={result.risks.length ? "warning" : "default"} />
                  </div>
                </div>

                {result.affected.length > 0 && (
                  <Panel title={`Affected (${result.affected.length})`}>
                    <div className="space-y-1.5">
                      {result.affected.slice(0, 20).map((a, i) => {
                        const meta = sevMeta[a.severity];
                        return (
                          <div key={i} className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2", meta.bg)}>
                            <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted">{a.type}</span>
                            <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{a.label}</span>
                            <span className={cn("shrink-0 text-[12px]", meta.tone)}>{a.effect}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Panel>
                )}

                {result.conflicts.length > 0 && (
                  <Panel title="Conflicts"><List items={result.conflicts} tone="warning" /></Panel>
                )}
                {result.risks.length > 0 && (
                  <Panel title="Risks"><List items={result.risks} tone="warning" /></Panel>
                )}

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" disabled title="Applying simulated changes is not enabled — this is a projection.">Apply (simulation only)</Button>
                  <Button variant="ghost" size="sm" onClick={() => setResult(null)}>Clear</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageBody>
    </>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "warning" }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-lg border bg-surface px-2.5 py-1 text-[12.5px]", tone === "warning" && value > 0 ? "border-warning/30 text-[#8a6600]" : "border-line text-ink")}>
      <span className="font-semibold tabular-nums">{value}</span> {label}
    </span>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-muted">{title}</h3>
      {children}
    </div>
  );
}

function List({ items, tone }: { items: string[]; tone: "warning" }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 text-[13px] text-ink/85">
          <AlertTriangle className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", tone === "warning" ? "text-warning" : "text-muted")} /> {it}
        </li>
      ))}
    </ul>
  );
}
