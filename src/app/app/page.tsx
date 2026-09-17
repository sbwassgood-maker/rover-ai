"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, Sparkles, FileText, Clock } from "lucide-react";
import { Sparkle } from "@/components/brand/Sparkle";
import { PageBody } from "@/components/app/PageHeader";
import { docs, homeTasks, aiActivity, currentUser, projects, statusMeta } from "@/lib/mock-data";
import { StatusDot } from "@/components/ui/Card";

export default function HomePage() {
  const router = useRouter();
  const [ask, setAsk] = useState("");
  const [tasks, setTasks] = useState(homeTasks.map((t) => ({ ...t, done: false })));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ask.trim()) router.push(`/app/ask?q=${encodeURIComponent(ask)}`);
  };

  return (
    <PageBody>
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Good morning, {currentUser.name}
        </h1>
        <p className="mt-1 text-[14.5px] text-muted">
          Here&rsquo;s what&rsquo;s happening across your workspace.
        </p>

        {/* Ask */}
        <form
          onSubmit={submit}
          className="mt-5 flex items-center gap-2.5 rounded-2xl border border-line bg-surface p-2.5 shadow-sm focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/10"
        >
          <Sparkle size={17} className="ml-1.5" />
          <input
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            placeholder="Ask Rover anything…"
            className="flex-1 bg-transparent text-[14.5px] text-ink outline-none placeholder:text-muted/70"
          />
          <button className="rounded-xl bg-accent px-3.5 py-2 text-[13.5px] font-medium text-white hover:bg-accent-hover">
            Ask
          </button>
        </form>

        {/* AI Brief */}
        <div className="mt-6 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.06] to-accent-soft/[0.04] p-5">
          <div className="flex items-center gap-2">
            <Sparkle size={15} />
            <span className="text-[14px] font-semibold text-ink">AI Brief</span>
          </div>
          <div className="mt-3 grid gap-1.5 text-[14px] text-ink/80 sm:grid-cols-3">
            <p>3 projects need attention.</p>
            <p>7 new customer insights.</p>
            <p>2 upcoming deadlines.</p>
          </div>
          <Link
            href="/app/ask?q=What needs my attention?"
            className="mt-3 inline-flex items-center gap-1 text-[13.5px] font-medium text-accent hover:gap-1.5 transition-all"
          >
            View briefing <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Grid */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {/* Continue working */}
          <Card title="Continue working" href="/app/docs" cta="All docs">
            <div className="space-y-1">
              {docs.slice(0, 4).map((d) => (
                <Link
                  key={d.id}
                  href={`/app/docs/${d.id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-ink/[0.03]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-canvas text-[13px] text-muted">
                    {d.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium text-ink">{d.title}</span>
                    <span className="block text-[12px] text-muted">Edited {d.updated}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Card>

          {/* Your tasks */}
          <Card title="Your tasks" href="/app/projects" cta="Projects">
            <div className="space-y-0.5">
              {tasks.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setTasks((prev) => prev.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-ink/[0.03]"
                >
                  <span
                    className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
                      t.done ? "border-success bg-success text-white" : "border-line"
                    }`}
                  >
                    {t.done && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className={`flex-1 text-[13.5px] ${t.done ? "text-muted line-through" : "text-ink"}`}>
                    {t.title}
                  </span>
                  <span className="flex items-center gap-1 text-[12px] text-muted">
                    <Clock className="h-3 w-3" /> {t.due}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* AI activity */}
          <Card title="AI activity" href="/app/agents" cta="Agents">
            <div className="space-y-2">
              {aiActivity.map((a) => (
                <div key={a} className="flex items-center gap-2.5 text-[13.5px] text-ink/85">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/12">
                    <Check className="h-3 w-3 text-success" strokeWidth={3} />
                  </span>
                  {a}
                </div>
              ))}
            </div>
          </Card>

          {/* Active projects */}
          <Card title="Active projects" href="/app/projects" cta="All projects">
            <div className="space-y-1">
              {projects.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href="/app/projects"
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-ink/[0.03]"
                >
                  <StatusDot tone={statusMeta[p.status].tone} />
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-ink">{p.name}</span>
                  <span className="inline-flex items-center gap-1 text-[12px] text-accent">
                    <Sparkle size={11} /> {p.insight}
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageBody>
  );
}

function Card({
  title,
  href,
  cta,
  children,
}: {
  title: string;
  href: string;
  cta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-[14px] font-semibold text-ink">{title}</h2>
        <Link href={href} className="text-[12.5px] font-medium text-muted hover:text-ink">
          {cta}
        </Link>
      </div>
      {children}
    </div>
  );
}
