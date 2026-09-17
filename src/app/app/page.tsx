"use client";
import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight, AlertTriangle, Activity as ActivityIcon, Rocket, CheckCircle2, Clock,
} from "lucide-react";
import { Sparkle } from "@/components/brand/Sparkle";
import { PageBody } from "@/components/app/PageHeader";
import { GoalLauncher } from "@/components/rover/GoalLauncher";
import { MissionStatusBadge } from "@/components/rover/status";
import { useRoverState } from "@/rover/useRover";
import { currentUser } from "@/lib/mock-data";
import { timeAgo } from "@/rover/format";

export default function MissionControl() {
  const s = useRoverState();

  const active = useMemo(
    () => s.missions.filter((m) => !["COMPLETED", "CANCELLED"].includes(m.status)),
    [s.missions]
  );
  const pendingApprovals = s.approvals.filter((a) => a.status === "pending");
  const atRiskMissions = s.missions.filter((m) => m.riskLevel === "high" && m.status !== "COMPLETED");
  const recentActivity = s.activity.slice(0, 6);

  return (
    <PageBody>
      <div className="mx-auto max-w-5xl">
        {/* Command center */}
        <div className="pt-2 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[12px] font-medium text-muted">
            <Sparkle size={13} /> Mission Control
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Good morning, {currentUser.name}
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-[15px] text-muted">
            Give Rover an outcome. It plans the work, runs specialized agents through
            real tools, verifies the result, and asks you when it matters.
          </p>
        </div>

        <div className="mt-7">
          <GoalLauncher />
        </div>

        {/* Attention strip */}
        {(pendingApprovals.length > 0 || atRiskMissions.length > 0) && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {pendingApprovals.length > 0 && (
              <Link href={`/app/missions/${pendingApprovals[0].missionId ?? ""}`} className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/[0.06] p-4 transition-colors hover:bg-warning/[0.1]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/15"><Clock className="h-4.5 w-4.5 text-[#8a6600]" /></span>
                <div className="flex-1">
                  <div className="text-[13.5px] font-semibold text-ink">{pendingApprovals.length} approval{pendingApprovals.length > 1 ? "s" : ""} waiting</div>
                  <div className="text-[12.5px] text-muted">Rover paused a high-risk action for your decision.</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted" />
              </Link>
            )}
            {atRiskMissions.length > 0 && (
              <Link href={`/app/missions/${atRiskMissions[0].id}`} className="flex items-center gap-3 rounded-xl border border-error/30 bg-error/[0.05] p-4 transition-colors hover:bg-error/[0.09]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-error/15"><AlertTriangle className="h-4.5 w-4.5 text-error" /></span>
                <div className="flex-1">
                  <div className="text-[13.5px] font-semibold text-ink">{atRiskMissions.length} mission{atRiskMissions.length > 1 ? "s" : ""} at risk</div>
                  <div className="text-[12.5px] text-muted">{atRiskMissions[0].name}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted" />
              </Link>
            )}
          </div>
        )}

        {/* Active missions */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink"><Rocket className="h-4 w-4 text-accent" /> Active missions</h2>
            <Link href="/app/missions" className="text-[12.5px] font-medium text-muted hover:text-ink">All missions</Link>
          </div>

          {active.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-12 text-center">
              <Sparkle size={20} className="mx-auto" />
              <p className="mt-3 text-[14px] font-medium text-ink">No active missions yet</p>
              <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted">
                Type an outcome above—like &ldquo;Launch our product&rdquo;—and Rover will turn it into a mission with a plan, agents, and verified work.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {active.map((m) => {
                const doneSteps = m.plan.filter((p) => p.status === "done").length;
                return (
                  <Link key={m.id} href={`/app/missions/${m.id}`} className="group rounded-2xl border border-line bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/30">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[15px] font-semibold text-ink">{m.name}</h3>
                      <MissionStatusBadge status={m.status} />
                    </div>
                    <p className="mt-1.5 line-clamp-1 text-[13px] text-muted">{m.goal}</p>
                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between text-[12px] text-muted">
                        <span>{m.currentPhase}</span><span>{m.progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
                        <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${m.progress}%` }} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-[12px] text-muted">
                      <span>{doneSteps}/{m.plan.length} steps</span>
                      <span>·</span>
                      <span>{m.runIds.length} agent runs</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity + what Rover did */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <h2 className="mb-2 flex items-center gap-2 px-1 text-[14px] font-semibold text-ink"><ActivityIcon className="h-4 w-4 text-accent" /> Rover activity</h2>
            <div className="space-y-1">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13px]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10"><Sparkle size={11} /></span>
                  <span className="flex-1 text-ink/85">{a.action}</span>
                  <span className="shrink-0 text-[11.5px] text-muted">{timeAgo(a.at)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <h2 className="mb-2 flex items-center gap-2 px-1 text-[14px] font-semibold text-ink"><CheckCircle2 className="h-4 w-4 text-success" /> What Rover produced</h2>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Missions" value={s.missions.length} />
              <Stat label="Agent runs" value={s.runs.length} />
              <Stat label="Tool calls" value={s.toolCalls.filter((c) => c.status === "ok").length} />
              <Stat label="Docs" value={s.docs.filter((d) => d.createdByRun).length} />
              <Stat label="Tasks" value={s.tasks.filter((t) => t.createdByRun).length} />
              <Stat label="Evidence" value={s.evidence.length} />
            </div>
          </div>
        </div>
      </div>
    </PageBody>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-canvas/50 p-3 text-center">
      <div className="text-xl font-semibold tabular-nums text-ink">{value}</div>
      <div className="text-[11.5px] text-muted">{label}</div>
    </div>
  );
}
