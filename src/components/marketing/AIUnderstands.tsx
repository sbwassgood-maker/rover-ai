"use client";
import { useEffect, useRef, useState } from "react";
import { FileText, ArrowRight } from "lucide-react";
import { Container, SectionHeading, Reveal } from "@/components/ui/Section";
import { Sparkle } from "@/components/brand/Sparkle";
import { Typewriter, ThinkingDots } from "@/components/ui/Typewriter";
import { Button } from "@/components/ui/Button";

const blockers = [
  { name: "API migration", owner: "Engineering", due: "Friday" },
  { name: "Mobile onboarding", owner: "Product", due: "Monday" },
  { name: "Billing integration", owner: "Engineering", due: "Tuesday" },
];

export function AIUnderstands() {
  const [phase, setPhase] = useState<"idle" | "thinking" | "answer">("idle");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && phase === "idle") {
          setPhase("thinking");
          setTimeout(() => setPhase("answer"), 1300);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [phase]);

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Ask your workspace"
            title="Rover doesn't just answer questions. It understands your workspace."
            description="Ask Rover about anything across your company. It understands your documents, projects, databases, meeting notes, and connected tools."
          />
        </Reveal>

        <Reveal delay={100} className="mx-auto mt-12 max-w-2xl">
          <div
            ref={ref}
            className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
          >
            {/* User message */}
            <div className="border-b border-line px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">
                  AM
                </div>
                <p className="pt-0.5 text-[15px] text-ink">
                  What are our biggest product blockers this week?
                </p>
              </div>
            </div>

            {/* Rover response */}
            <div className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <Sparkle size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  {phase === "thinking" && (
                    <div className="flex items-center gap-2 pt-1 text-sm text-muted">
                      <ThinkingDots /> Searching projects & meetings…
                    </div>
                  )}

                  {phase === "answer" && (
                    <div className="animate-fade-in">
                      <p className="text-[15px] text-ink">
                        <Typewriter text="I found 6 active blockers across Engineering and Product." speed={16} />
                      </p>

                      <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-error">
                        High priority
                      </div>
                      <div className="mt-2 space-y-2">
                        {blockers.map((b, i) => (
                          <div
                            key={b.name}
                            className="flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas/50 px-3 py-2.5 animate-fade-up"
                            style={{ animationDelay: `${400 + i * 120}ms` }}
                          >
                            <div className="flex items-center gap-2.5">
                              <FileText className="h-4 w-4 text-muted" />
                              <span className="text-[14px] font-medium text-ink">
                                {b.name}
                              </span>
                            </div>
                            <div className="text-[12.5px] text-muted">
                              {b.owner} · Due {b.due}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="ai" size="sm">
                          <Sparkle size={13} className="text-white" /> Create report
                        </Button>
                        <Button variant="secondary" size="sm">
                          View sources <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="mt-3 text-[12px] text-muted">
                        Based on 6 sources across Projects and Meetings.
                      </p>
                    </div>
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
