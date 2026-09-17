"use client";
import { useEffect, useRef, useState } from "react";
import { Search, Check, FileText } from "lucide-react";
import { Container, SectionHeading, Reveal } from "@/components/ui/Section";
import { Sparkle } from "@/components/brand/Sparkle";
import { Typewriter } from "@/components/ui/Typewriter";

const scanned = [
  { label: "34 documents", },
  { label: "12 project pages" },
  { label: "486 meeting notes" },
  { label: "2 connected apps" },
];

const sources = ["Q4 Pricing Strategy", "Product Strategy Meeting", "Sales Planning"];

export function SearchDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(-1);
  const [answer, setAnswer] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && step === -1) {
          io.disconnect();
          scanned.forEach((_, i) =>
            setTimeout(() => setStep(i), 350 + i * 320)
          );
          setTimeout(() => setAnswer(true), 350 + scanned.length * 320 + 200);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [step]);

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="AI search"
            title="Search everything. Ask anything."
            description="Rover searches across your workspace and connected tools to find the exact answer—with sources."
          />
        </Reveal>

        <Reveal delay={100} className="mx-auto mt-12 max-w-2xl">
          <div ref={ref} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            {/* Search bar */}
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <Search className="h-4.5 w-4.5 text-muted" />
              <span className="text-[15px] text-ink">
                What did we decide about the Q4 pricing strategy?
              </span>
            </div>

            {/* Scan */}
            <div className="border-b border-line px-5 py-4">
              <div className="text-[12px] font-medium text-muted">Rover searched</div>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {scanned.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex items-center gap-2 text-[13px] transition-all duration-300 ${
                      step >= i ? "text-ink opacity-100" : "text-muted opacity-40"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors ${
                        step >= i ? "bg-success text-white" : "bg-ink/10"
                      }`}
                    >
                      {step >= i && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    {s.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Answer */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-2">
                <Sparkle size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                  Answer
                </span>
              </div>
              {answer ? (
                <div className="animate-fade-in">
                  <p className="mt-2 text-[15px] leading-relaxed text-ink">
                    <Typewriter
                      text="The team decided to introduce three pricing tiers—Free, Team, and Enterprise—with Team positioned as the recommended plan at $20 per user per month."
                      speed={12}
                    />
                  </p>
                  <div className="mt-4 text-[12px] font-medium text-muted">Sources</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sources.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1 text-[12.5px] text-ink"
                      >
                        <FileText className="h-3.5 w-3.5 text-muted" />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-ink/5" />
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
