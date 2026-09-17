"use client";
import Link from "next/link";
import { useState } from "react";
import { Rocket } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { GoalLauncher } from "@/components/rover/GoalLauncher";
import { MissionStatusBadge, RiskBadge } from "@/components/rover/status";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useRoverState } from "@/rover/useRover";
import { timeAgo } from "@/rover/format";

export default function MissionsPage() {
  const s = useRoverState();
  const [newOpen, setNewOpen] = useState(false);
  const missions = s.missions;

  return (
    <>
      <PageHeader
        title="Missions"
        description="Outcomes Rover is working on. Each mission plans, executes, verifies and monitors."
        actions={<Button onClick={() => setNewOpen(true)}><Rocket className="h-4 w-4" /> New mission</Button>}
      />
      <PageBody>
        {missions.length === 0 ? (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-dashed border-line bg-surface/50 p-8 text-center">
              <Rocket className="mx-auto h-6 w-6 text-accent" />
              <h2 className="mt-3 text-[15px] font-semibold text-ink">Start your first mission</h2>
              <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted">Describe an outcome and Rover will handle the work.</p>
            </div>
            <div className="mt-6"><GoalLauncher /></div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl space-y-2.5">
            {missions.map((m) => {
              const done = m.plan.filter((p) => p.status === "done").length;
              return (
                <Link key={m.id} href={`/app/missions/${m.id}`} className="block rounded-2xl border border-line bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/30">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-[15px] font-semibold text-ink">{m.name}</h3>
                      <MissionStatusBadge status={m.status} />
                      {m.riskLevel !== "low" && <RiskBadge level={m.riskLevel} />}
                    </div>
                    <span className="text-[12px] text-muted">Updated {timeAgo(m.updatedAt)}</span>
                  </div>
                  <p className="mt-1.5 line-clamp-1 text-[13px] text-muted">{m.goal}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
                      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${m.progress}%` }} />
                    </div>
                    <span className="shrink-0 text-[12px] tabular-nums text-muted">{done}/{m.plan.length} · {m.progress}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </PageBody>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="New mission">
        <div className="p-5">
          <p className="mb-4 text-[13.5px] text-muted">Describe the outcome you want. Rover extracts the intent, plans the work, and runs it.</p>
          <GoalLauncher compact />
        </div>
      </Modal>
    </>
  );
}
