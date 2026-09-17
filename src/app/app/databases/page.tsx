"use client";
import { useState } from "react";
import { Table2, Kanban, Filter, ArrowDownUp, Search, Plus } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/Card";
import { Sparkle } from "@/components/brand/Sparkle";
import { ThinkingDots, Typewriter } from "@/components/ui/Typewriter";
import { projects, statusMeta, teamMembers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function Person({ name }: { name: string }) {
  const m = teamMembers.find((x) => x.name === name);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ backgroundColor: m?.color ?? "#6B6B73" }}>
        {m?.initials}
      </span>
      <span className="text-ink/80">{name.split(" ")[0]}</span>
    </span>
  );
}

export default function DatabasesPage() {
  const [view, setView] = useState("table");
  const [ai, setAi] = useState<"idle" | "loading" | "done">("idle");
  const [q, setQ] = useState("");

  const analyze = () => { setAi("loading"); setTimeout(() => setAi("done"), 1200); };
  const rows = projects.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Projects"
        description="A database with intelligence built in."
        actions={
          <>
            <Button variant="ai" size="sm" onClick={analyze}>
              <Sparkle size={13} className="text-white" /> Analyze database
            </Button>
            <Button size="sm"><Plus className="h-4 w-4" /> New</Button>
          </>
        }
      />
      <PageBody>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Tabs
            active={view}
            onChange={setView}
            size="sm"
            tabs={[
              { id: "table", label: "Table", icon: <Table2 className="h-3.5 w-3.5" /> },
              { id: "board", label: "Board", icon: <Kanban className="h-3.5 w-3.5" /> },
            ]}
          />
          <div className="flex items-center gap-1 text-muted">
            <button className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12.5px] hover:text-ink"><Filter className="h-3.5 w-3.5" /> Filter</button>
            <button className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12.5px] hover:text-ink"><ArrowDownUp className="h-3.5 w-3.5" /> Sort</button>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-md border border-line bg-surface px-2.5">
            <Search className="h-3.5 w-3.5 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-8 w-32 bg-transparent text-[13px] outline-none" />
          </div>
        </div>

        {ai !== "idle" && (
          <div className="mb-4 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.05] to-transparent p-4">
            <div className="flex items-center gap-2">
              <Sparkle size={14} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">AI analysis</span>
            </div>
            {ai === "loading" ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted"><ThinkingDots /> Analyzing records…</div>
            ) : (
              <p className="mt-2 text-[14px] leading-relaxed text-ink">
                <Typewriter text="3 projects are at risk. The CRM migration is the highest priority because its dependency is blocking two teams." speed={12} />
              </p>
            )}
          </div>
        )}

        {view === "table" ? (
          <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full text-left text-[13.5px]">
              <thead className="border-b border-line text-[12px] text-muted">
                <tr>
                  {["Name", "Status", "Owner", "Priority", "Due date", "AI Summary"].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0 hover:bg-ink/[0.02]">
                    <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-ink/80"><StatusDot tone={statusMeta[p.status].tone} /> {statusMeta[p.status].label}</span></td>
                    <td className="px-4 py-3"><Person name={p.owner} /></td>
                    <td className="px-4 py-3 capitalize text-ink/80">{p.priority}</td>
                    <td className="px-4 py-3 text-muted">{p.due}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-accent"><Sparkle size={11} /> {p.insight}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(["active", "blocked", "review"] as const).map((st) => (
              <div key={st} className="rounded-2xl border border-line bg-canvas/40 p-3">
                <div className="mb-2 flex items-center gap-1.5 px-1 text-[12.5px] font-semibold text-ink">
                  <StatusDot tone={statusMeta[st].tone} /> {statusMeta[st].label}
                </div>
                <div className="space-y-2">
                  {rows.filter((p) => p.status === st || (st === "active" && p.status === "on-track")).map((p) => (
                    <div key={p.id} className="rounded-xl border border-line bg-surface p-3 shadow-sm">
                      <div className="text-[13.5px] font-medium text-ink">{p.name}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <Person name={p.owner} />
                        <span className="inline-flex items-center gap-1 text-[11px] text-accent"><Sparkle size={10} /> {p.insight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}
