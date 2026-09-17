import {
  MessageSquareText,
  PenLine,
  Search,
  BarChart3,
  FileStack,
  Zap,
} from "lucide-react";
import { Container, SectionHeading, Reveal } from "@/components/ui/Section";

const features = [
  { icon: MessageSquareText, title: "Ask Rover", body: "Ask questions and get answers based on your company's knowledge." },
  { icon: PenLine, title: "Write", body: "Create, rewrite, summarize, translate, and improve documents." },
  { icon: Search, title: "Search", body: "Search your entire workspace using natural language." },
  { icon: BarChart3, title: "Analyze", body: "Turn databases and information into useful insights." },
  { icon: FileStack, title: "Create", body: "Generate documents, plans, reports, and project briefs." },
  { icon: Zap, title: "Act", body: "Let Rover update pages, create tasks, and execute approved workflows." },
];

export function FeatureGrid() {
  return (
    <section id="product" className="scroll-mt-20 py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="One AI for everything"
            title="One workspace. Endless possibilities."
            description="Every AI feature has a clear purpose—and works from the same source of truth."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="group h-full rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-canvas transition-colors group-hover:border-accent/30 group-hover:bg-accent/5">
                  <f.icon className="h-5 w-5 text-ink transition-colors group-hover:text-accent" strokeWidth={2} />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
