import { Lock, ShieldCheck, ScrollText, KeyRound, SlidersHorizontal, Scale } from "lucide-react";
import { Container, SectionHeading, Reveal } from "@/components/ui/Section";

const cards = [
  { icon: Lock, title: "Encryption", body: "Protect data in transit and at rest." },
  { icon: ShieldCheck, title: "Permissions", body: "Control what people and AI can access." },
  { icon: ScrollText, title: "Audit logs", body: "Understand what actions AI performed." },
  { icon: KeyRound, title: "SSO", body: "Secure authentication for your organization." },
  { icon: SlidersHorizontal, title: "Data controls", body: "Manage retention and access policies." },
  { icon: Scale, title: "Governance", body: "Control agents, integrations, and automated actions." },
];

export function Security() {
  return (
    <section className="relative overflow-hidden bg-night py-24 text-white sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_20%,transparent_75%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[700px] -translate-x-1/2 rounded-full bg-accent/20 blur-[130px]" />
      <Container className="relative">
        <Reveal>
          <SectionHeading
            tone="light"
            eyebrow="Security"
            title="Enterprise-ready from day one."
            description="Designed for enterprise security requirements. Give administrators control over who—and what AI—can access your team's knowledge."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 60}>
              <div className="h-full rounded-2xl border border-night-line bg-night-surface p-6 transition-colors hover:border-accent/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-night-line bg-white/[0.03]">
                  <c.icon className="h-5 w-5 text-accent-soft" />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-white">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-night-muted">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
