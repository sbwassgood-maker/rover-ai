import { Rocket, BarChart3, GraduationCap, MessageSquareHeart, FolderKanban, Library } from "lucide-react";
import { Container, SectionHeading, Reveal } from "@/components/ui/Section";

const cases = [
  { icon: Rocket, title: "Launch a product", flow: "Research → strategy → roadmap → execution" },
  { icon: BarChart3, title: "Run weekly reporting", flow: "Collect → analyze → summarize → distribute" },
  { icon: GraduationCap, title: "Onboard employees", flow: "Gather docs → answer questions → create tasks" },
  { icon: MessageSquareHeart, title: "Analyze customer feedback", flow: "Collect → categorize → identify trends → prioritize" },
  { icon: FolderKanban, title: "Manage projects", flow: "Track → summarize → identify blockers → notify owners" },
  { icon: Library, title: "Create company knowledge", flow: "Capture → organize → connect → search" },
];

export function UseCases() {
  return (
    <section id="use-cases" className="scroll-mt-20 py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Use cases"
            title="What will you build with Rover?"
            description="From launch to reporting, Rover connects the steps so your team can focus on the work that matters."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c, i) => (
            <Reveal key={c.title} delay={i * 50}>
              <div className="group h-full rounded-2xl border border-line bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-canvas transition-colors group-hover:border-accent/30 group-hover:bg-accent/5">
                  <c.icon className="h-5 w-5 text-ink transition-colors group-hover:text-accent" />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{c.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{c.flow}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
