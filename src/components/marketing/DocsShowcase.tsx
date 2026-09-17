import { Container, SectionHeading, Reveal } from "@/components/ui/Section";
import { Sparkle } from "@/components/brand/Sparkle";
import { BrowserFrame } from "@/components/ui/BrowserFrame";

export function DocsShowcase() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Documents"
            title="Documents that work with you."
            description="Write, organize, and collaborate in flexible documents—with an AI writing partner one shortcut away."
          />
        </Reveal>

        <Reveal delay={100} className="mx-auto mt-12 max-w-4xl">
          <BrowserFrame url="app.rover.ai/docs">
            <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr]">
              {/* Editor */}
              <div className="p-6 sm:p-8">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted">Product</div>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  Q4 Product Strategy
                </h3>
                <div className="mt-6 space-y-4 text-[14.5px] leading-relaxed text-ink/85">
                  <div>
                    <div className="text-[15px] font-semibold text-ink">Overview</div>
                    <p className="mt-1.5 text-muted">
                      Our Q4 strategy focuses on improving activation, retention,
                      and expansion.
                    </p>
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-ink">Goals</div>
                    <ol className="mt-1.5 space-y-1.5 text-muted">
                      <li className="flex gap-2"><span className="text-muted/60">1.</span> Increase activation</li>
                      <li className="flex gap-2"><span className="text-muted/60">2.</span> Reduce churn</li>
                      <li className="flex gap-2"><span className="text-muted/60">3.</span> Improve onboarding</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* AI panel */}
              <div className="border-t border-line bg-canvas/50 p-5 lg:border-l lg:border-t-0">
                <div className="flex items-center gap-2">
                  <Sparkle size={15} />
                  <span className="text-[13px] font-semibold text-ink">Rover</span>
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink/80">
                  I found three related documents. Would you like me to:
                </p>
                <div className="mt-3 space-y-2">
                  {["Create strategy summary", "Find conflicting information", "Turn this into a roadmap"].map((a) => (
                    <button
                      key={a}
                      className="flex w-full items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-left text-[13.5px] text-ink transition-all hover:border-accent/30 hover:bg-accent/[0.04]"
                    >
                      <Sparkle size={13} />
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </BrowserFrame>
        </Reveal>
      </Container>
    </section>
  );
}
