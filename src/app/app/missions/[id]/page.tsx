"use client";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, Check, Circle, Target, ListChecks, AlertTriangle, FileText,
  Sparkles as SparklesIcon, ShieldCheck, Clock, XCircle, CheckCircle2, RotateCcw,
} from "lucide-react";
import { Sparkle } from "@/components/brand/Sparkle";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MissionStatusBadge, RiskBadge } from "@/components/rover/status";
import { RunReceipt } from "@/components/rover/RunReceipt";
import { EvidenceWhy } from "@/components/rover/EvidenceWhy";
import { SandboxDiff, SandboxBanner } from "@/components/rover/SandboxDiff";
import { FlaskConical } from "lucide-react";
import { useRoverState } from "@/rover/useRover";
import { getStore } from "@/rover/store";
import { getOrchestrator } from "@/rover/orchestrator";
import { timeAgo } from "@/rover/format";
import { nowISO, uid } from "@/rover/id";
import { cn } from "@/lib/utils";

export default function MissionDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const s = useRoverState();
  const toast = useToast();

  const mission = s.missions.find((m) => m.id === id);
  const runs = useMemo(() => s.runs.filter((r) => r.missionId === id), [s.runs, id]);
  const approvals = s.approvals.filter((a) => a.missionId === id);
  const pending = approvals.filter((a) => a.status === "pending");
  const missionTasks = s.tasks.filter((t) => t.missionId === id);
  const runIds = new Set(runs.map((r) => r.id));
  const missionDocs = s.docs.filter((d) => d.createdByRun && runIds.has(d.createdByRun));
  const evidence = s.evidence.filter((e) => s.toolCalls.some((c) => runIds.has(c.runId) && c.evidenceIds.includes(e.id)));
  const activity = s.activity.filter((a) => a.missionId === id);
  const sandboxChanges = s.sandbox.filter((c) => c.missionId === id);
  const stagedCount = sandboxChanges.filter((c) => c.status === "staged").length;

  if (!mission) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-[15px] font-medium text-ink">Mission not found</p>
        <Button variant="secondary" onClick={() => router.push("/app/missions")}>Back to missions</Button>
      </div>
    );
  }

  const decide = (approvalId: string, status: "approved" | "rejected") => {
    getStore().setState((prev) => ({
      ...prev,
      approvals: prev.approvals.map((a) => (a.id === approvalId ? { ...a, status, decidedAt: nowISO() } : a)),
    }));
    // if all decided, resume the mission
    const stillPending = getStore().getState().approvals.filter((a) => a.missionId === id && a.status === "pending");
    if (stillPending.length === 0) {
      getStore().setState((prev) => ({
        ...prev,
        activity: [{ id: uid("act"), workspaceId: prev.workspace.id, actor: "Alex Morgan", action: `${status === "approved" ? "Approved" : "Rejected"} a high-risk action`, missionId: id, at: nowISO() }, ...prev.activity],
      }));
      getOrchestrator().resumeMission(id);
      toast.push({ title: status === "approved" ? "Approved — Rover is continuing" : "Rejected", tone: "ai" });
    }
  };

  const rerun = () => {
    getOrchestrator().runMission(id);
    toast.push({ title: "Re-running mission", tone: "ai" });
  };

  return (
    <div className="overflow-y-auto">
      {/* Header */}
      <div className="border-b border-line px-5 py-5 sm:px-8">
        <button onClick={() => router.push("/app/missions")} className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Missions
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-ink">{mission.name}</h1>
              <MissionStatusBadge status={mission.status} />
              {mission.riskLevel !== "low" && <RiskBadge level={mission.riskLevel} />}
              {mission.sandboxMode && <SandboxBanner />}
            </div>
            <p className="mt-1 text-[13.5px] text-muted">Original intent: &ldquo;{mission.originalIntent}&rdquo;</p>
          </div>
          <div className="flex items-center gap-2">
            {(mission.status === "BLOCKED" || mission.status === "FAILED") && (
              <Button variant="secondary" size="sm" onClick={rerun}><RotateCcw className="h-4 w-4" /> Re-run</Button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 max-w-md">
          <div className="mb-1 flex items-center justify-between text-[12px] text-muted">
            <span>{mission.currentPhase}</span><span>{mission.progress}% complete</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink/[0.06]">
            <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${mission.progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Waiting for you */}
          {pending.length > 0 && (
            <section className="rounded-2xl border border-warning/30 bg-warning/[0.05] p-5">
              <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink"><Clock className="h-4 w-4 text-[#8a6600]" /> Waiting for you</h2>
              <div className="mt-3 space-y-2">
                {pending.map((a) => (
                  <div key={a.id} className="rounded-xl border border-line bg-surface p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-error/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-error">{a.risk}</span>
                      <span className="text-[13.5px] font-medium text-ink">{a.title}</span>
                    </div>
                    <p className="mt-1 text-[12.5px] text-muted">{a.detail}</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={() => decide(a.id, "approved")}>Approve</Button>
                      <Button size="sm" variant="secondary" onClick={() => decide(a.id, "rejected")}>Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sandbox review */}
          {sandboxChanges.length > 0 && (
            <section className={cn("rounded-2xl border p-5", stagedCount > 0 ? "border-accent/30 bg-accent/[0.04]" : "border-line bg-surface shadow-card")}>
              <h2 className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-ink"><FlaskConical className="h-4 w-4 text-accent" /> Sandbox {stagedCount > 0 && `— ${stagedCount} change${stagedCount !== 1 ? "s" : ""} to review`}</h2>
              <p className="mb-3 text-[12.5px] text-muted">These changes have not touched your live workspace. Review and apply what you want.</p>
              <SandboxDiff changes={sandboxChanges} missionId={id} />
            </section>
          )}

          {/* Intent */}
          <Section icon={Target} title="Intent">
            <div className="grid gap-4 sm:grid-cols-3">
              <IntentList label="Objectives" items={mission.intent.objectives} />
              <IntentList label="Constraints" items={mission.intent.constraints} />
              <IntentList label="Success criteria" items={mission.successCriteria} />
            </div>
          </Section>

          {/* Plan */}
          <Section icon={ListChecks} title="Plan">
            <ol className="space-y-1.5">
              {mission.plan.map((step) => (
                <li key={step.id} className="flex items-center gap-2.5">
                  {step.status === "done" ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-white"><Check className="h-3 w-3" strokeWidth={3} /></span>
                  ) : step.status === "active" ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15"><span className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" /></span>
                  ) : (
                    <Circle className="h-5 w-5 text-line" />
                  )}
                  <span className={cn("text-[14px]", step.status === "done" ? "text-muted" : step.status === "active" ? "font-medium text-ink" : "text-muted")}>{step.title}</span>
                </li>
              ))}
            </ol>
          </Section>

          {/* Agent runs */}
          <Section icon={SparklesIcon} title={`Agent activity (${runs.length})`}>
            {runs.length === 0 ? (
              <p className="text-[13px] text-muted">No agent runs yet.</p>
            ) : (
              <div className="space-y-2">
                {runs.map((r) => <RunReceipt key={r.id} run={r} state={s} />)}
              </div>
            )}
          </Section>

          {/* Produced work */}
          {(missionDocs.length > 0 || missionTasks.length > 0) && (
            <Section icon={FileText} title="Produced work">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-1.5 text-[12px] font-medium text-muted">Documents ({missionDocs.length})</div>
                  <div className="space-y-1">
                    {missionDocs.map((d) => (
                      <Link key={d.id} href={`/app/docs/${d.id}`} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[13px] text-ink hover:border-accent/30">
                        <span className="text-muted">{d.emoji}</span> <span className="truncate">{d.title}</span>
                      </Link>
                    ))}
                    {missionDocs.length === 0 && <p className="text-[12.5px] text-muted">None yet.</p>}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 text-[12px] font-medium text-muted">Tasks ({missionTasks.length})</div>
                  <div className="space-y-1">
                    {missionTasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[13px] text-ink">
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border border-line" /> <span className="truncate">{t.title}</span>
                        <span className="ml-auto shrink-0 text-[11px] text-muted">{t.assignee.split(" ")[0]}</span>
                      </div>
                    ))}
                    {missionTasks.length === 0 && <p className="text-[12.5px] text-muted">None yet.</p>}
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* Evidence */}
          {evidence.length > 0 && (
            <Section icon={ShieldCheck} title={`Evidence (${evidence.length})`}>
              <div className="space-y-1.5">
                {evidence.slice(0, 8).map((e) => (
                  <div key={e.id} className="flex items-start gap-2.5 rounded-lg border border-line px-3 py-2">
                    <span className="mt-0.5 rounded bg-ink/5 px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted">{e.sourceType}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-ink">{e.sourceLabel}</div>
                      {e.section && <div className="truncate text-[12px] text-muted">{e.section}</div>}
                    </div>
                    <span className="shrink-0 text-[11px] text-muted">{Math.round(e.confidence * 100)}%</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Outcome */}
          {mission.outcome && (
            <section className={cn("rounded-2xl border p-5", mission.status === "MONITORING" || mission.status === "COMPLETED" ? "border-success/30 bg-success/[0.05]" : "border-warning/30 bg-warning/[0.05]")}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                  {mission.status === "MONITORING" || mission.status === "COMPLETED" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-[#8a6600]" />}
                  Outcome
                </h2>
                <EvidenceWhy claim={mission.outcome} evidence={evidence.slice(0, 5)} label="Proof" />
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink/85">{mission.outcome}</p>
            </section>
          )}
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          <SideCard title="Risks">
            {mission.risks.length === 0 ? <p className="text-[12.5px] text-muted">No risks detected.</p> : (
              <div className="space-y-2">
                {mission.risks.map((r) => (
                  <div key={r.id} className="flex items-start gap-2 text-[13px]">
                    <AlertTriangle className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", r.level === "high" ? "text-error" : r.level === "medium" ? "text-warning" : "text-muted")} />
                    <span className="text-ink/85">{r.label}</span>
                  </div>
                ))}
              </div>
            )}
          </SideCard>

          <SideCard title="Timeline">
            <div className="space-y-2.5">
              {activity.slice(0, 12).map((a) => (
                <div key={a.id} className="flex gap-2.5">
                  <div className="flex flex-col items-center">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <span className="w-px flex-1 bg-line" />
                  </div>
                  <div className="pb-1">
                    <div className="text-[12.5px] text-ink/85">{a.action}</div>
                    <div className="text-[11px] text-muted">{a.actor} · {timeAgo(a.at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </SideCard>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <h2 className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-ink"><Icon className="h-4 w-4 text-accent" /> {title}</h2>
      {children}
    </section>
  );
}

function IntentList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-1.5 text-[13px] text-ink/85"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted/60" /> {it}</li>
        ))}
      </ul>
    </div>
  );
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <h3 className="mb-2.5 text-[13px] font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}
