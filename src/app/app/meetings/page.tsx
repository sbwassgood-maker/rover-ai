"use client";
import { useState } from "react";
import { Check, Circle, CalendarDays } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/Button";
import { Sparkle } from "@/components/brand/Sparkle";
import { ThinkingDots } from "@/components/ui/Typewriter";
import { meetings, teamMembers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function MeetingsPage() {
  const [selected, setSelected] = useState(meetings[0].id);
  const [ask, setAsk] = useState<"idle" | "loading" | "done">("idle");
  const m = meetings.find((x) => x.id === selected)!;

  const runAsk = () => { setAsk("loading"); setTimeout(() => setAsk("done"), 1100); };

  return (
    <>
      <PageHeader title="Meetings" description="Every meeting becomes knowledge." />
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          {/* List */}
          <div className="space-y-2">
            {meetings.map((mt) => (
              <button
                key={mt.id}
                onClick={() => { setSelected(mt.id); setAsk("idle"); }}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-colors",
                  selected === mt.id ? "border-accent/30 bg-accent/[0.04]" : "border-line bg-surface hover:border-ink/20"
                )}
              >
                <div className="flex items-center gap-2 text-[13.5px] font-medium text-ink">
                  <CalendarDays className="h-4 w-4 text-muted" /> {mt.title}
                </div>
                <div className="mt-1 text-[12px] text-muted">{mt.date} · {mt.time}</div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="rounded-2xl border border-line bg-surface p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">{m.title}</h2>
                <div className="mt-1 flex items-center gap-2 text-[13px] text-muted">
                  <span className="inline-flex items-center gap-1"><Circle className="h-2 w-2 fill-error text-error" /> Recorded</span>
                  · {m.date} · {m.time}
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={runAsk}>
                <Sparkle size={13} /> Ask about this meeting
              </Button>
            </div>

            {/* Participants */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[12px] text-muted">Participants</span>
              <div className="flex -space-x-1.5">
                {m.participants.map((p) => {
                  const tm = teamMembers.find((x) => x.name === p);
                  return (
                    <span key={p} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface text-[9px] font-semibold text-white" style={{ backgroundColor: tm?.color ?? "#6B6B73" }} title={p}>
                      {tm?.initials ?? p[0]}
                    </span>
                  );
                })}
              </div>
            </div>

            {ask !== "idle" && (
              <div className="mt-4 rounded-xl border border-accent/20 bg-accent/[0.04] p-3">
                {ask === "loading" ? (
                  <div className="flex items-center gap-2 text-sm text-muted"><ThinkingDots /> Reviewing the transcript…</div>
                ) : (
                  <p className="text-[13.5px] leading-relaxed text-ink animate-fade-in">
                    The key outcome was prioritizing onboarding for Q4. Sarah owns the proposal; the launch is set for April 14.
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 space-y-6">
              <div>
                <div className="text-[13px] font-semibold text-ink">Summary</div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{m.summary}</p>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-ink">Decisions</div>
                <ul className="mt-2 space-y-1.5">
                  {m.decisions.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-[14px] text-ink/85">
                      <Check className="h-4 w-4 text-success" strokeWidth={2.5} /> {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-ink">Action items</div>
                <ul className="mt-2 space-y-2">
                  {m.actions.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-[14px] text-ink/85">
                      <span className="flex h-4 w-4 items-center justify-center rounded-[5px] border border-line" />
                      <span className="rounded-md bg-ink/[0.05] px-2 py-0.5 text-[12.5px] font-medium text-ink">{a.who}</span>
                      <span className="text-muted/60">→</span> {a.what}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}
