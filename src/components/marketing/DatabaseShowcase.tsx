"use client";
import { useState } from "react";
import { Container, SectionHeading, Reveal } from "@/components/ui/Section";
import { Sparkle } from "@/components/brand/Sparkle";
import { StatusDot } from "@/components/ui/Card";
import { Typewriter, ThinkingDots } from "@/components/ui/Typewriter";
import { cn } from "@/lib/utils";

const rows = [
  { name: "Website", status: "Active", tone: "success", owner: "Sarah", insight: "2 blockers" },
  { name: "Mobile App", status: "On track", tone: "success", owner: "Alex", insight: "Launch ready" },
  { name: "CRM", status: "Blocked", tone: "error", owner: "Mike", insight: "API issue" },
] as const;

export function DatabaseShowcase() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const analyze = () => {
    if (state !== "idle") return;
    setState("loading");
    setTimeout(() => setState("done"), 1200);
  };

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Databases"
            title="Your data, with intelligence built in."
            description="Turn structured information into insight. Ask Rover to analyze any database in one click."
          />
        </Reveal>

        <Reveal delay={100} className="mx-auto mt-12 max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <span className="text-[13px] font-semibold uppercase tracking-wider text-muted">Projects</span>
              <button
                onClick={analyze}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
              >
                <Sparkle size={13} className="text-white" /> Analyze database
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-line text-[12px] font-medium text-muted">
                    <th className="px-5 py-2.5 font-medium">Project</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                    <th className="px-5 py-2.5 font-medium">Owner</th>
                    <th className="px-5 py-2.5 font-medium">AI Insight</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.name} className="border-b border-line last:border-0">
                      <td className="px-5 py-3 font-medium text-ink">{r.name}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-ink/80">
                          <StatusDot tone={r.tone} /> {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted">{r.owner}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-accent">
                          <Sparkle size={12} /> {r.insight}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Analysis */}
            <div
              className={cn(
                "grid transition-all duration-500 ease-out",
                state === "idle" ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-accent/20 bg-gradient-to-br from-accent/[0.05] to-transparent px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Sparkle size={14} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                      AI analysis
                    </span>
                  </div>
                  {state === "loading" ? (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted">
                      <ThinkingDots /> Analyzing 3 projects…
                    </div>
                  ) : (
                    state === "done" && (
                      <p className="mt-2 text-[14.5px] leading-relaxed text-ink">
                        <Typewriter
                          text="3 projects are at risk. The CRM migration is the highest priority because its dependency is blocking two teams."
                          speed={13}
                        />
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
