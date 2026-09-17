import { FileText } from "lucide-react";
import { Container, SectionHeading, Reveal } from "@/components/ui/Section";
import { Sparkle } from "@/components/brand/Sparkle";

const prompts = [
  "What did we decide about pricing?",
  "Summarize this week's product discussions.",
  "Which projects are currently blocked?",
  "Create a launch plan from these documents.",
  "Find everything related to customer churn.",
];

const sources = ["Product Strategy", "Pricing Discussion", "Q3 Planning", "Sales Feedback"];

export function AIAssistant() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <SectionHeading
                align="left"
                eyebrow="AI assistant"
                title="Ask your workspace anything."
                description="Rover understands the context of your workspace—not just the words in your prompt."
              />
              <ul className="mt-8 space-y-2.5">
                {prompts.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-[14px] text-ink transition-colors hover:border-accent/30"
                  >
                    <Sparkle size={14} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <div className="flex items-center gap-2">
                <Sparkle size={16} />
                <span className="text-[14px] font-semibold text-ink">Rover</span>
              </div>
              <p className="mt-4 text-[14px] font-medium text-ink">
                What did we decide about pricing?
              </p>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink/85">
                I found 12 relevant sources across your workspace. The team agreed
                to launch with three tiers, positioning{" "}
                <span className="font-medium text-ink">Team at $20/user/month</span>{" "}
                as the recommended plan.
              </p>
              <div className="mt-5 text-[12px] font-medium text-muted">Related sources</div>
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
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
