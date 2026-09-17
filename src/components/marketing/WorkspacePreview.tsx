"use client";
import {
  Home,
  Search,
  Sparkles,
  Bot,
  FileText,
  FolderKanban,
  Table2,
  CalendarDays,
  Settings,
  ArrowRight,
} from "lucide-react";
import { RoverMark } from "@/components/brand/Logo";
import { Sparkle } from "@/components/brand/Sparkle";
import { docs } from "@/lib/mock-data";

const nav = [
  { icon: Home, label: "Home", active: true },
  { icon: Sparkles, label: "Ask Rover", ai: true },
  { icon: Search, label: "Search" },
  { icon: Bot, label: "Agents" },
];

const workspace = [
  { icon: FileText, label: "Docs" },
  { icon: FolderKanban, label: "Projects" },
  { icon: Table2, label: "Databases" },
  { icon: CalendarDays, label: "Meetings" },
];

/** Realistic Rover workspace UI used as the hero centerpiece. */
export function WorkspacePreview() {
  return (
    <div className="flex h-[440px] w-full bg-surface text-left sm:h-[520px]">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-canvas/60 p-3 sm:flex">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <RoverMark size={20} className="text-ink" />
          <span className="text-sm font-semibold tracking-tight text-ink">
            rover <span className="text-accent">AI</span>
          </span>
        </div>

        <div className="mt-4 space-y-0.5">
          {nav.map((n) => (
            <div
              key={n.label}
              className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] ${
                n.active
                  ? "bg-ink/[0.06] font-medium text-ink"
                  : "text-muted hover:bg-ink/5"
              }`}
            >
              <n.icon
                className={`h-4 w-4 ${n.ai ? "text-accent" : ""}`}
                strokeWidth={2}
              />
              {n.label}
            </div>
          ))}
        </div>

        <div className="mt-5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted/70">
          Workspace
        </div>
        <div className="mt-1.5 space-y-0.5">
          {workspace.map((n) => (
            <div
              key={n.label}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-muted hover:bg-ink/5"
            >
              <n.icon className="h-4 w-4" strokeWidth={2} />
              {n.label}
            </div>
          ))}
        </div>

        <div className="mt-5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted/70">
          Team
        </div>
        <div className="mt-1.5 space-y-0.5">
          {["Marketing", "Engineering", "Sales", "Product"].map((t) => (
            <div
              key={t}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-muted hover:bg-ink/5"
            >
              <span className="h-2 w-2 rounded-[3px] bg-muted/40" />
              {t}
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-line pt-2">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-muted hover:bg-ink/5">
            <Settings className="h-4 w-4" strokeWidth={2} />
            Settings
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Ask bar */}
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-canvas/60 px-3 py-2">
            <Sparkle size={14} />
            <span className="text-[13px] text-muted">Ask Rover anything…</span>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success/15 text-[11px] font-semibold text-success">
            AM
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6">
          <h3 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
            Good morning, Alex
          </h3>
          <p className="mt-1 text-[13px] text-muted">
            Here&rsquo;s what&rsquo;s happening across your workspace.
          </p>

          {/* AI Brief */}
          <div className="mt-4 rounded-xl border border-accent/20 bg-gradient-to-br from-accent/[0.06] to-accent-soft/[0.05] p-4">
            <div className="flex items-center gap-2">
              <Sparkle size={14} />
              <span className="text-[13px] font-semibold text-ink">AI Brief</span>
            </div>
            <div className="mt-2.5 space-y-1 text-[13px] text-ink/80">
              <p>3 projects need attention.</p>
              <p>7 new customer insights.</p>
              <p>2 upcoming deadlines.</p>
            </div>
            <button className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-accent">
              View briefing <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Cards */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MiniCard title="Active projects" rows={[["Website redesign", "3 blockers"], ["Mobile app", "On track"], ["CRM migration", "Blocked"]]} />
            <MiniCard title="Recent documents" rows={docs.slice(0, 3).map((d) => [d.title, d.updated])} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3.5">
      <div className="text-[12px] font-semibold text-ink">{title}</div>
      <div className="mt-2.5 space-y-2">
        {rows.map(([a, b], i) => (
          <div key={i} className="flex items-center justify-between gap-2 text-[12.5px]">
            <span className="truncate text-ink/80">{a}</span>
            <span className="shrink-0 text-muted">{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
