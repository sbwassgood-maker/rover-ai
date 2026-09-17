"use client";
import { useState } from "react";
import { List, Kanban, GanttChart, Sparkles, Plus } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/Card";
import { Sparkle } from "@/components/brand/Sparkle";
import { ThinkingDots, Typewriter } from "@/components/ui/Typewriter";
import { projects, boardColumns, statusMeta, teamMembers, type Priority } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const prioTone: Record<Priority, string> = {
  high: "text-error",
  medium: "text-warning",
  low: "text-muted",
};

function Avatar({ name }: { name: string }) {
  const m = teamMembers.find((x) => x.name === name);
  return (
    <span
      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: m?.color ?? "#6B6B73" }}
      title={name}
    >
      {m?.initials ?? name[0]}
    </span>
  );
}

export default function ProjectsPage() {
  const [view, setView] = useState("board");
  const [ai, setAi] = useState<"idle" | "loading" | "done">("idle");

  const analyze = () => {
    setAi("loading");
    setTimeout(() => setAi("done"), 1200);
  };

  return (
    <>
      <PageHeader
        title="Website redesign"
        description="Product · 6 projects · updated 2h ago"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={analyze}>
              <Sparkle size={13} /> Ask Rover about this project
            </Button>
            <Button size="sm"><Plus className="h-4 w-4" /> New task</Button>
          </>
        }
      />
      <PageBody>
        <div className="mb-4 flex items-center justify-between">
          <Tabs
            active={view}
            onChange={setView}
            size="sm"
            tabs={[
              { id: "list", label: "List", icon: <List className="h-3.5 w-3.5" /> },
              { id: "board", label: "Board", icon: <Kanban className="h-3.5 w-3.5" /> },
              { id: "timeline", label: "Timeline", icon: <GanttChart className="h-3.5 w-3.5" /> },
            ]}
          />
        </div>

        {/* AI analysis */}
        {ai !== "idle" && (
          <div className="mb-4 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.05] to-transparent p-4">
            <div className="flex items-center gap-2">
              <Sparkle size={14} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">AI analysis</span>
            </div>
            {ai === "loading" ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted"><ThinkingDots /> Analyzing tasks and blockers…</div>
            ) : (
              <p className="mt-2 text-[14px] leading-relaxed text-ink">
                <Typewriter text="This project has 3 open blockers, all due Friday. The homepage hero is on the critical path—consider reassigning the analytics task to unblock it." speed={12} />
              </p>
            )}
          </div>
        )}

        {view === "board" && (
          <div className="grid gap-3 md:grid-cols-4">
            {boardColumns.map((col) => (
              <div key={col.id} className="rounded-2xl border border-line bg-canvas/40 p-3">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
                    <StatusDot tone={statusMeta[col.id].tone} /> {col.title}
                  </span>
                  <span className="text-[12px] text-muted">{col.tasks.length}</span>
                </div>
                <div className="space-y-2">
                  {col.tasks.map((t) => (
                    <div key={t.id} className="rounded-xl border border-line bg-surface p-3 shadow-sm transition-shadow hover:shadow-card">
                      <div className={cn("text-[13.5px] font-medium text-ink", t.done && "text-muted line-through")}>{t.title}</div>
                      <div className="mt-2.5 flex items-center justify-between">
                        <Avatar name={t.assignee} />
                        <span className={cn("text-[11px] font-medium capitalize", prioTone[t.priority])}>{t.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === "list" && (
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <table className="w-full text-left text-[13.5px]">
              <thead className="border-b border-line text-[12px] text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Project</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Owner</th>
                  <th className="px-4 py-2.5 font-medium">Priority</th>
                  <th className="px-4 py-2.5 font-medium">Due</th>
                  <th className="px-4 py-2.5 font-medium">AI insight</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0 hover:bg-ink/[0.02]">
                    <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-ink/80"><StatusDot tone={statusMeta[p.status].tone} /> {statusMeta[p.status].label}</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-2 text-ink/80"><Avatar name={p.owner} /> {p.owner.split(" ")[0]}</span></td>
                    <td className={cn("px-4 py-3 capitalize font-medium", prioTone[p.priority])}>{p.priority}</td>
                    <td className="px-4 py-3 text-muted">{p.due}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-accent"><Sparkle size={11} /> {p.insight}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === "timeline" && (
          <div className="space-y-2.5 rounded-2xl border border-line bg-surface p-5">
            {projects.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-36 shrink-0 truncate text-[13px] font-medium text-ink">{p.name}</span>
                <div className="relative h-6 flex-1 rounded-md bg-canvas">
                  <div
                    className="absolute top-0 h-6 rounded-md bg-accent/20 border border-accent/30"
                    style={{ left: `${i * 8}%`, width: `${35 + i * 6}%` }}
                  >
                    <span className="absolute inset-0 flex items-center px-2 text-[11px] font-medium text-accent">
                      {statusMeta[p.status].label}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}
