import { Container, SectionHeading, Reveal } from "@/components/ui/Section";
import { testimonials } from "@/lib/mock-data";

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Loved by teams"
            title="A calmer way to work together."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 70}>
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-card">
                <blockquote className="flex-1 text-[15px] leading-relaxed text-ink">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/[0.06] text-[12px] font-semibold text-muted">
                    {t.name.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <div>
                    <div className="text-[13px] font-medium text-ink">{t.name}</div>
                    <div className="text-[12px] text-muted">
                      {t.role}, {t.company}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] text-muted/70">
          Placeholder testimonials — shown until real, approved quotes are supplied.
        </p>
      </Container>
    </section>
  );
}
