"use client";
import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { Container, SectionHeading, Reveal } from "@/components/ui/Section";
import { Sparkle } from "@/components/brand/Sparkle";
import { StatusDot } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const cards = [
  { name: "Research Agent", body: "Research topics and create structured reports.", status: "Working", tone: "warning" as const },
  { name: "Weekly Brief Agent", body: "Creates an executive briefing every Monday.", status: "Scheduled", tone: "ai" as const },
  { name: "Customer Insights Agent", body: "Analyzes customer feedback and identifies trends.", status: "Active", tone: "success" as const },
  { name: "Content Agent", body: "Turns product updates into publish-ready content.", status: "Active", tone: "success" as const },
];

const dataSources = ["Projects", "Docs", "Meetings", "Customer feedback"];

export function AgentsShowcase() {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState(false);
  const [selected, setSelected] = useState<string[]>(dataSources);

  const toggle = (s: string) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const close = () => {
    setOpen(false);
    setTimeout(() => setCreated(false), 200);
  };

  return (
    <section id="agents" className="scroll-mt-20 py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="AI agents"
            title="Turn repetitive work into agents."
            description="Create specialized AI agents that understand your workspace and handle recurring work."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {cards.map((c, i) => (
            <Reveal key={c.name} delay={i * 60}>
              <div className="flex h-full items-start justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-card">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Sparkle size={15} />
                    <h3 className="text-[15px] font-semibold text-ink">{c.name}</h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.body}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1 text-[12px] font-medium text-ink">
                  <StatusDot tone={c.tone} pulse={c.status === "Working"} /> {c.status}
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-8 flex justify-center">
          <Button variant="ai" size="lg" onClick={() => setOpen(true)}>
            <Sparkle size={15} className="text-white" /> Create an agent
          </Button>
        </Reveal>
      </Container>

      <Modal open={open} onClose={close} title={created ? undefined : "Create an agent"}>
        {created ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/12">
              <Check className="h-6 w-6 text-success" strokeWidth={2.5} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-ink">Agent created</h3>
            <p className="mt-1.5 text-sm text-muted">
              Your Weekly Executive Brief will run every Monday at 8:00 AM.
            </p>
            <Button variant="secondary" className="mt-6" onClick={close}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4 p-5">
            <Field label="Agent name">
              <Input defaultValue="Weekly Executive Brief" />
            </Field>
            <Field label="What should it do?">
              <Textarea
                rows={4}
                defaultValue={
                  "Every Monday, review company metrics, project updates, customer feedback and important meetings. Then create a concise executive briefing."
                }
              />
            </Field>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-ink">Data sources</span>
              <div className="flex flex-wrap gap-2">
                {dataSources.map((s) => {
                  const on = selected.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggle(s)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                        on
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-line bg-surface text-muted hover:border-ink/20"
                      )}
                    >
                      {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <Field label="Schedule">
              <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas/50 px-3 py-2.5 text-sm text-ink">
                <Clock className="h-4 w-4 text-muted" />
                Every Monday · 8:00 AM
              </div>
            </Field>
            <Button variant="ai" className="w-full" onClick={() => setCreated(true)}>
              <Sparkle size={14} className="text-white" /> Create Agent
            </Button>
          </div>
        )}
      </Modal>
    </section>
  );
}
