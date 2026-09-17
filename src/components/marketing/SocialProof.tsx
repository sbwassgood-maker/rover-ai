import { Container, Reveal } from "@/components/ui/Section";
import { socialProof } from "@/lib/mock-data";

export function SocialProof() {
  return (
    <section className="border-y border-line/70 py-12">
      <Container>
        <Reveal>
          <p className="text-center text-[13px] font-medium text-muted">
            Built for teams that move fast
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {socialProof.map((name) => (
              <span
                key={name}
                className="text-lg font-semibold tracking-tight text-ink/70"
              >
                {name}
              </span>
            ))}
          </div>
          <p className="mt-5 text-center text-[11px] text-muted/70">
            Placeholder marks — replace with real, approved customer logos.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
