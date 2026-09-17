import { Check } from "lucide-react";
import { Container, SectionHeading, Reveal } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "",
    blurb: "For individuals exploring Rover.",
    features: ["Personal workspace", "Basic AI", "Limited documents", "Basic search", "Limited agents"],
    cta: "Start for free",
    href: "/onboarding",
    variant: "secondary" as const,
    featured: false,
  },
  {
    name: "Team",
    price: "$20",
    cadence: "/user/month",
    blurb: "For growing teams.",
    features: [
      "Unlimited documents",
      "Advanced AI",
      "Workspace search",
      "AI agents",
      "Automations",
      "Meeting notes",
      "Team collaboration",
      "Integrations",
      "Permissions",
    ],
    cta: "Start Team",
    href: "/onboarding",
    variant: "ai" as const,
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    blurb: "For organizations deploying Rover at scale.",
    features: [
      "Advanced permissions",
      "SSO",
      "Audit logs",
      "Governance",
      "Advanced integrations",
      "Custom controls",
      "Dedicated support",
    ],
    cta: "Contact sales",
    href: "#",
    variant: "secondary" as const,
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Pricing"
            title="Simple pricing that scales with you."
            description="Start free. Upgrade when your team is ready."
          />
        </Reveal>

        <div className="mt-14 grid items-start gap-5 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 70}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border bg-surface p-6",
                  t.featured
                    ? "border-accent/40 shadow-glow lg:-mt-3 lg:mb-3"
                    : "border-line shadow-card"
                )}
              >
                {t.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                    Recommended
                  </span>
                )}
                <h3 className="text-[15px] font-semibold text-ink">{t.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-tight text-ink">{t.price}</span>
                  <span className="text-[13px] text-muted">{t.cadence}</span>
                </div>
                <p className="mt-2 text-[13.5px] text-muted">{t.blurb}</p>

                <ButtonLink href={t.href} variant={t.variant} className="mt-5 w-full">
                  {t.cta}
                </ButtonLink>

                <ul className="mt-6 space-y-2.5 border-t border-line pt-5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-ink/85">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
