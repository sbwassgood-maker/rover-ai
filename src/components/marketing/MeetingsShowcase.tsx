import { Check } from "lucide-react";
import { Container, SectionHeading, Reveal } from "@/components/ui/Section";
import { Sparkle } from "@/components/brand/Sparkle";
import { Button } from "@/components/ui/Button";

export function MeetingsShowcase() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Meetings"
            title="Every meeting becomes knowledge."
            description="Rover captures summaries, decisions, and action items—so nothing gets lost."
          />
        </Reveal>

        <Reveal delay={100} className="mx-auto mt-12 max-w-2xl">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">Product Strategy</h3>
              <span className="text-[13px] text-muted">September 17</span>
            </div>

            <div className="mt-6 space-y-6 text-[14.5px]">
              <div>
                <div className="text-[13px] font-semibold text-ink">Summary</div>
                <p className="mt-1.5 leading-relaxed text-muted">
                  The team agreed to prioritize onboarding improvements for Q4.
                </p>
              </div>

              <div>
                <div className="text-[13px] font-semibold text-ink">Decisions</div>
                <ul className="mt-2 space-y-1.5">
                  {["Simplify signup flow", "Add guided onboarding", "Measure activation rate"].map((d) => (
                    <li key={d} className="flex items-center gap-2 text-ink/85">
                      <Check className="h-4 w-4 text-success" strokeWidth={2.5} /> {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[13px] font-semibold text-ink">Action items</div>
                <ul className="mt-2 space-y-2">
                  {[
                    ["Sarah", "Draft onboarding proposal"],
                    ["Alex", "Review analytics"],
                    ["Mike", "Estimate engineering effort"],
                  ].map(([who, what]) => (
                    <li key={who} className="flex items-center gap-2 text-ink/85">
                      <span className="rounded-md bg-ink/[0.05] px-2 py-0.5 text-[12.5px] font-medium text-ink">
                        {who}
                      </span>
                      <span className="text-muted/60">→</span>
                      {what}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 border-t border-line pt-4">
              <Button variant="secondary" size="sm">
                <Sparkle size={13} /> Ask about this meeting
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
