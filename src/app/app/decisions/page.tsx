"use client";
import { useState } from "react";
import { GitBranch, Users, FileText, ChevronDown } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/Card";
import { EvidenceWhy } from "@/components/rover/EvidenceWhy";
import { useRoverState } from "@/rover/useRover";
import { cn } from "@/lib/utils";
import type { DecisionStatus } from "@/rover/types";

const statusTone: Record<DecisionStatus, "success" | "neutral" | "warning"> = {
  active: "success",
  superseded: "neutral",
  revisiting: "warning",
};

export default function DecisionsPage() {
  const s = useRoverState();
  const [open, setOpen] = useState<string | null>(s.decisions[0]?.id ?? null);

  return (
    <>
      <PageHeader
        title="Decision Memory"
        description="Decisions Rover has captured — with the reasoning, people, alternatives, and evidence behind each one."
      />
      <PageBody>
        <div className="mx-auto max-w-3xl space-y-2.5">
          {s.decisions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line bg-surface/50 p-8 text-center text-[13px] text-muted">
              No decisions recorded yet. Rover captures decisions from meetings and completed missions.
            </div>
          )}
          {s.decisions.map((d) => {
            const isOpen = open === d.id;
            const evidence = s.evidence.filter((e) => d.evidenceIds.includes(e.id));
            return (
              <div key={d.id} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                <button onClick={() => setOpen(isOpen ? null : d.id)} className="flex w-full items-start gap-3 p-5 text-left">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10"><GitBranch className="h-4 w-4 text-accent" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[15px] font-semibold text-ink">{d.decision}</h3>
                      <Badge tone={statusTone[d.status]}>{d.status}</Badge>
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-muted">{d.source} · {d.date}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted transition-transform", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                  <div className="border-t border-line px-5 py-4 animate-fade-in">
                    <Row label="Rationale">{d.rationale}</Row>
                    <Row label="People">
                      <span className="inline-flex flex-wrap items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted" />
                        {d.people.join(", ")}
                      </span>
                    </Row>
                    {d.alternatives.length > 0 && (
                      <Row label="Alternatives considered">{d.alternatives.join(" · ")}</Row>
                    )}
                    {d.affects.length > 0 && (
                      <Row label="Affects">
                        <span className="flex flex-wrap gap-1.5">
                          {d.affects.map((a) => (
                            <span key={a.id} className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2 py-0.5 text-[12px] text-ink">
                              <FileText className="h-3 w-3 text-muted" /> {a.label}
                            </span>
                          ))}
                        </span>
                      </Row>
                    )}
                    <div className="mt-3">
                      <EvidenceWhy claim={d.decision} evidence={evidence} label="Why this decision?" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PageBody>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2.5 grid grid-cols-[130px_1fr] gap-3 text-[13.5px]">
      <span className="text-[12px] font-medium uppercase tracking-wider text-muted">{label}</span>
      <span className="text-ink/85">{children}</span>
    </div>
  );
}
