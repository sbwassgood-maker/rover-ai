"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, FolderKanban, Table2, CalendarDays, Bot, Sparkles, CornerDownLeft } from "lucide-react";
import { Sparkle } from "@/components/brand/Sparkle";
import { docs, projects, meetings } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Item = { id: string; label: string; group: string; icon: React.ElementType; href: string };

const staticItems: Item[] = [
  { id: "ask", label: "Ask Rover", group: "Actions", icon: Sparkles, href: "/app/ask" },
  { id: "agents", label: "Agents", group: "Actions", icon: Bot, href: "/app/agents" },
  ...docs.map((d) => ({ id: `doc-${d.id}`, label: d.title, group: "Documents", icon: FileText, href: `/app/docs/${d.id}` })),
  ...projects.map((p) => ({ id: `proj-${p.id}`, label: p.name, group: "Projects", icon: FolderKanban, href: "/app/projects" })),
  ...meetings.map((m) => ({ id: `meet-${m.id}`, label: m.title, group: "Meetings", icon: CalendarDays, href: "/app/meetings" })),
  { id: "db", label: "Projects database", group: "Databases", icon: Table2, href: "/app/databases" },
];

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    if (!q.trim()) return staticItems;
    return staticItems.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()));
  }, [q]);

  useEffect(() => setActive(0), [q, open]);

  useEffect(() => {
    if (!open) return;
    setQ("");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      if (e.key === "Enter") {
        e.preventDefault();
        if (active === 0 && q.trim()) {
          router.push(`/app/ask?q=${encodeURIComponent(q)}`);
          onClose();
        } else {
          const item = results[q.trim() ? active - 1 : active];
          if (item) { router.push(item.href); onClose(); }
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, results, active, q, router, onClose]);

  if (!open) return null;

  const groups = results.reduce<Record<string, Item[]>>((acc, it) => {
    (acc[it.group] ??= []).push(it);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-float animate-scale-in">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4.5 w-4.5 text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Rover, or ask a question…"
            className="h-12 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/70"
          />
          <kbd className="rounded border border-line bg-canvas px-1.5 py-0.5 text-[11px] text-muted">Esc</kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {q.trim() && (
            <button
              onClick={() => { router.push(`/app/ask?q=${encodeURIComponent(q)}`); onClose(); }}
              onMouseEnter={() => setActive(0)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left",
                active === 0 ? "bg-accent/[0.08]" : "hover:bg-ink/[0.03]"
              )}
            >
              <Sparkle size={16} />
              <span className="flex-1 text-[14px] text-ink">
                Ask Rover: <span className="font-medium">&ldquo;{q}&rdquo;</span>
              </span>
              <CornerDownLeft className="h-3.5 w-3.5 text-muted" />
            </button>
          )}

          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mt-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted/70">
                {group}
              </div>
              {items.map((it) => {
                const idx = results.indexOf(it) + (q.trim() ? 1 : 0);
                return (
                  <button
                    key={it.id}
                    onClick={() => { router.push(it.href); onClose(); }}
                    onMouseEnter={() => setActive(idx)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left",
                      active === idx ? "bg-ink/[0.05]" : "hover:bg-ink/[0.03]"
                    )}
                  >
                    <it.icon className="h-4 w-4 text-muted" />
                    <span className="flex-1 text-[14px] text-ink">{it.label}</span>
                  </button>
                );
              })}
            </div>
          ))}

          {results.length === 0 && !q.trim() && (
            <div className="px-3 py-8 text-center text-sm text-muted">No results</div>
          )}
        </div>
      </div>
    </div>
  );
}
