import { ArrowDown, Clock, BookOpen, LineChart, FileText, Send } from "lucide-react";
import { Container, SectionHeading, Reveal } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Sparkle } from "@/components/brand/Sparkle";

const steps = [
  { icon: Clock, label: "WHEN", body: "Every Friday at 4:00 PM", tone: "neutral" },
  { icon: BookOpen, label: "Rover reads", body: "Sales metrics · Support tickets · Customer feedback · Project updates", tone: "ai" },
  { icon: LineChart, label: "Rover analyzes", body: "Trends · Risks · Changes · Blockers", tone: "ai" },
  { icon: FileText, label: "Rover creates", body: "Weekly executive report", tone: "ai" },
  { icon: Send, label: "Rover sends", body: "Leadership", tone: "neutral" },
];

export function AutomationShowcase() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Automation"
            title="Stop doing the same work twice."
            description="Compose triggers and actions into workflows that run on their own."
          />
        </Reveal>

        <Reveal delay={100} className="mx-auto mt-12 max-w-lg">
          <div className="flex flex-col items-center">
            {steps.map((s, i) => (
              <div key={i} className="flex w-full flex-col items-center">
                <div
                  className={`w-full rounded-2xl border p-4 ${
                    s.tone === "ai"
                      ? "border-accent/20 bg-gradient-to-br from-accent/[0.05] to-transparent"
                      : "border-line bg-surface"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        s.tone === "ai" ? "bg-accent/10" : "bg-ink/[0.04]"
                      }`}
                    >
                      <s.icon
                        className={`h-4 w-4 ${s.tone === "ai" ? "text-accent" : "text-ink"}`}
                      />
                    </span>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                        {s.label}
                      </div>
                      <div className="text-[14px] font-medium text-ink">{s.body}</div>
                    </div>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <ArrowDown className="my-2 h-4 w-4 text-muted/50" />
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={140} className="mt-8 flex justify-center">
          <Button variant="secondary" size="lg">
            <Sparkle size={14} /> Build an automation
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
