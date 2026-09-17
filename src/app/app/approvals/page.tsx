"use client";
import Link from "next/link";
import { Clock, Check, X, ArrowRight, ShieldCheck } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { useRoverState } from "@/rover/useRover";
import { getStore } from "@/rover/store";
import { getOrchestrator } from "@/rover/orchestrator";
import { timeAgo } from "@/rover/format";
import { nowISO, uid } from "@/rover/id";

export default function ApprovalsPage() {
  const s = useRoverState();
  const toast = useToast();
  const pending = s.approvals.filter((a) => a.status === "pending");
  const decided = s.approvals.filter((a) => a.status !== "pending");

  const decide = (approvalId: string, missionId: string | undefined, status: "approved" | "rejected") => {
    getStore().setState((prev) => ({
      ...prev,
      approvals: prev.approvals.map((a) => (a.id === approvalId ? { ...a, status, decidedAt: nowISO() } : a)),
      activity: [{ id: uid("act"), workspaceId: prev.workspace.id, actor: "Alex Morgan", action: `${status === "approved" ? "Approved" : "Rejected"} a high-risk action`, missionId, at: nowISO() }, ...prev.activity],
    }));
    if (missionId) {
      const stillPending = getStore().getState().approvals.filter((a) => a.missionId === missionId && a.status === "pending");
      if (stillPending.length === 0) getOrchestrator().resumeMission(missionId);
    }
    toast.push({ title: status === "approved" ? "Approved" : "Rejected", tone: status === "approved" ? "ai" : undefined });
  };

  return (
    <>
      <PageHeader title="Approvals" description="High-risk actions Rover paused for your decision. Nothing runs until you approve." />
      <PageBody>
        <div className="mx-auto max-w-3xl space-y-6">
          <section>
            <h2 className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-ink"><Clock className="h-4 w-4 text-[#8a6600]" /> Pending ({pending.length})</h2>
            {pending.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-surface/50 p-8 text-center text-[13px] text-muted">
                <ShieldCheck className="mx-auto mb-2 h-6 w-6 text-success" />
                Nothing waiting. Rover only pauses for actions above an agent&rsquo;s risk ceiling.
              </div>
            ) : (
              <div className="space-y-2">
                {pending.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-warning/30 bg-warning/[0.05] p-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-error/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-error">{a.risk}</span>
                      <span className="text-[14px] font-semibold text-ink">{a.title}</span>
                    </div>
                    <p className="mt-1 text-[13px] text-muted">{a.detail}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" onClick={() => decide(a.id, a.missionId, "approved")}><Check className="h-4 w-4" /> Approve</Button>
                      <Button size="sm" variant="secondary" onClick={() => decide(a.id, a.missionId, "rejected")}><X className="h-4 w-4" /> Reject</Button>
                      {a.missionId && <Link href={`/app/missions/${a.missionId}`} className="ml-auto inline-flex items-center gap-1 text-[12.5px] text-muted hover:text-ink">View mission <ArrowRight className="h-3.5 w-3.5" /></Link>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {decided.length > 0 && (
            <section>
              <h2 className="mb-2 text-[13px] font-semibold text-ink">Decided ({decided.length})</h2>
              <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                {decided.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
                    <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] font-semibold text-muted">{a.risk}</span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{a.title}</span>
                    <Badge tone={a.status === "approved" ? "success" : "error"}>{a.status}</Badge>
                    <span className="shrink-0 text-[11.5px] text-muted">{a.decidedAt ? timeAgo(a.decidedAt) : ""}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </PageBody>
    </>
  );
}
