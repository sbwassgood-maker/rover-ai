"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ScrollText, Search, ArrowUpRight } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { Sparkle } from "@/components/brand/Sparkle";
import { useRoverState } from "@/rover/useRover";
import { timeAgo } from "@/rover/format";
import { cn } from "@/lib/utils";

type Filter = "all" | "rover" | "human";

export default function AuditPage() {
  const s = useRoverState();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    return s.activity.filter((a) => {
      if (filter === "rover" && a.actor === "Alex Morgan") return false;
      if (filter === "human" && a.actor !== "Alex Morgan") return false;
      if (q && !`${a.actor} ${a.action}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [s.activity, filter, q]);

  const missionName = (id?: string) => s.missions.find((m) => m.id === id)?.name;

  return (
    <>
      <PageHeader title="Audit log" description="Every action Rover and your team have taken — agent runs, tool calls, approvals and decisions." />
      <PageBody>
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3">
              <Search className="h-4 w-4 text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter log…" className="h-9 w-48 bg-transparent text-[13.5px] outline-none placeholder:text-muted/70" />
            </div>
            <div className="flex items-center gap-1">
              {(["all", "rover", "human"] as Filter[]).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={cn("rounded-md px-2.5 py-1.5 text-[12.5px] font-medium capitalize transition-colors", filter === f ? "bg-ink text-white" : "text-muted hover:text-ink")}>{f}</button>
              ))}
            </div>
            <span className="ml-auto text-[12px] text-muted">{rows.length} entries</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            {rows.length === 0 && <div className="px-4 py-10 text-center text-[13px] text-muted">No matching entries.</div>}
            {rows.map((a) => {
              const isRover = a.actor !== "Alex Morgan";
              const mName = missionName(a.missionId);
              return (
                <div key={a.id} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
                  <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", isRover ? "bg-accent/10" : "bg-success/15")}>
                    {isRover ? <Sparkle size={13} /> : <span className="text-[10px] font-semibold text-success">AM</span>}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] text-ink/90"><span className="font-medium">{a.actor}</span> {a.action}</div>
                    {mName && (
                      <Link href={`/app/missions/${a.missionId}`} className="inline-flex items-center gap-0.5 text-[11.5px] text-muted hover:text-accent">
                        {mName} <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                  <span className="shrink-0 text-[11.5px] text-muted">{timeAgo(a.at)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </PageBody>
    </>
  );
}
