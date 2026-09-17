import { Container, SectionHeading, Reveal } from "@/components/ui/Section";
import { integrations } from "@/lib/mock-data";

export function Integrations() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Connect your tools"
            title="Rover works where your team works."
            description="Bring context from the tools you already use. Connect and configure integrations from your workspace settings."
          />
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {integrations.map((it, i) => (
            <Reveal key={it.name} delay={i * 30}>
              <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-card">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas text-[13px] font-semibold text-ink">
                  {it.glyph}
                </span>
                <span className="truncate text-[13.5px] font-medium text-ink">{it.name}</span>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-xl text-center text-[13px] text-muted">
          Integration marks shown are generic representations. Availability
          depends on your plan and workspace configuration.
        </p>
      </Container>
    </section>
  );
}
