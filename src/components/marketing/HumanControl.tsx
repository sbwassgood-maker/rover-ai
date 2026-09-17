"use client";
import { useState } from "react";
import { Mail, Database, ShoppingCart, Check, X } from "lucide-react";
import { Container, SectionHeading, Reveal } from "@/components/ui/Section";
import { Sparkle } from "@/components/brand/Sparkle";
import { cn } from "@/lib/utils";

const requests = [
  { icon: Mail, title: "Send campaign email", detail: "428 recipients" },
  { icon: Database, title: "Update 17 customer records", detail: "CRM · Salesforce" },
  { icon: ShoppingCart, title: "Create purchase order", detail: "$12,400" },
];

export function HumanControl() {
  const [decision, setDecision] = useState<"none" | "approved" | "rejected">("none");

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Human control"
            title="AI does the work. You stay in control."
            description="You decide what Rover can access and which actions require approval before they run."
          />
        </Reveal>

        <Reveal delay={100} className="mx-auto mt-12 max-w-lg">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <div className="flex items-center gap-2">
              <Sparkle size={15} />
              <span className="text-[14px] font-semibold text-ink">Rover wants to:</span>
            </div>

            <div className="mt-4 space-y-2.5">
              {requests.map((r) => (
                <div
                  key={r.title}
                  className="flex items-center gap-3 rounded-xl border border-line bg-canvas/50 px-4 py-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink/[0.04]">
                    <r.icon className="h-4 w-4 text-ink" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium text-ink">{r.title}</div>
                    <div className="text-[12.5px] text-muted">{r.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {decision === "none" ? (
              <div className="mt-5 flex gap-2">
                <button className="flex-1 rounded-lg border border-line py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-ink/5">
                  Review
                </button>
                <button
                  onClick={() => setDecision("approved")}
                  className="flex-1 rounded-lg bg-ink py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-ink/90"
                >
                  Approve
                </button>
                <button
                  onClick={() => setDecision("rejected")}
                  className="rounded-lg border border-line px-4 py-2.5 text-[14px] font-medium text-error transition-colors hover:bg-error/5"
                >
                  Reject
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  "mt-5 flex items-center gap-2 rounded-lg px-4 py-3 text-[14px] font-medium animate-fade-in",
                  decision === "approved"
                    ? "bg-success/10 text-success"
                    : "bg-error/10 text-error"
                )}
              >
                {decision === "approved" ? (
                  <><Check className="h-4 w-4" /> Approved — Rover will proceed.</>
                ) : (
                  <><X className="h-4 w-4" /> Rejected — no action taken.</>
                )}
                <button
                  onClick={() => setDecision("none")}
                  className="ml-auto text-[13px] font-normal text-muted underline underline-offset-2"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
          <p className="mt-4 text-center text-[13px] text-muted">
            Control what Rover can access and which actions require approval.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
