"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, FileText, FolderKanban, Table2, CalendarDays, User } from "lucide-react";
import { Sparkle } from "@/components/brand/Sparkle";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { AIResponseView } from "@/components/app/AIResponse";
import { getAIResponse } from "@/lib/ai-mock";
import { docs, projects, meetings, teamMembers } from "@/lib/mock-data";
import { ThinkingDots } from "@/components/ui/Typewriter";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [loading, setLoading] = useState(false);

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setSubmitted(q);
    setTimeout(() => setLoading(false), 900);
  };

  const groups = useMemo(() => {
    const term = submitted.toLowerCase();
    const match = (s: string) => !term || s.toLowerCase().includes(term);
    return {
      Documents: docs.filter((d) => match(d.title) || match(d.excerpt)).map((d) => ({ id: d.id, label: d.title, sub: `Edited ${d.updated}`, icon: FileText, href: `/app/docs/${d.id}` })),
      Projects: projects.filter((p) => match(p.name)).map((p) => ({ id: p.id, label: p.name, sub: `Owner: ${p.owner}`, icon: FolderKanban, href: "/app/projects" })),
      Meetings: meetings.filter((m) => match(m.title) || match(m.summary)).map((m) => ({ id: m.id, label: m.title, sub: m.date, icon: CalendarDays, href: "/app/meetings" })),
      Databases: match("projects") ? [{ id: "db", label: "Projects database", sub: "6 records", icon: Table2, href: "/app/databases" }] : [],
      People: teamMembers.filter((m) => match(m.name)).map((m) => ({ id: m.id, label: m.name, sub: m.role, icon: User, href: "#" })),
    };
  }, [submitted]);

  const res = submitted ? getAIResponse(submitted) : null;

  return (
    <>
      <PageHeader title="Search" description="Search everything, or ask a question in natural language." />
      <PageBody>
        <div className="mx-auto max-w-3xl">
          <form onSubmit={run} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 shadow-sm focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/10">
            <Search className="h-4.5 w-4.5 text-muted" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Rover…"
              className="h-12 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/70"
            />
          </form>

          {!submitted ? (
            <div className="mt-16 text-center text-sm text-muted">
              Try &ldquo;customer churn&rdquo; or &ldquo;What did we decide about pricing?&rdquo;
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* AI answer */}
              <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.05] to-transparent p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkle size={15} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                    AI answer
                  </span>
                </div>
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <ThinkingDots /> Searching your workspace…
                  </div>
                ) : (
                  res && <AIResponseView res={res} />
                )}
              </div>

              {/* Grouped results */}
              {!loading &&
                Object.entries(groups).map(([group, items]) =>
                  items.length ? (
                    <div key={group}>
                      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted/70">
                        {group}
                      </div>
                      <div className="overflow-hidden rounded-xl border border-line bg-surface">
                        {items.map((it) => (
                          <Link
                            key={it.id}
                            href={it.href}
                            className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0 hover:bg-ink/[0.02]"
                          >
                            <it.icon className="h-4 w-4 text-muted" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13.5px] font-medium text-ink">{it.label}</span>
                              <span className="block text-[12px] text-muted">{it.sub}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
            </div>
          )}
        </div>
      </PageBody>
    </>
  );
}
