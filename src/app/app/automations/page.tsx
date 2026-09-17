"use client";
import { useState } from "react";
import { Plus, ArrowDown, Clock, Filter, Copy, Bell, Zap } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/Button";
import { Sparkle } from "@/components/brand/Sparkle";
import { StatusDot } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

const flow = [
  { tag: "WHEN", label: "A new customer feedback item is created", icon: Bell, tone: "neutral" },
  { tag: "THEN", label: "Rover categorizes it", icon: Sparkle, tone: "ai" },
  { tag: "THEN", label: "Rover checks for duplicates", icon: Copy, tone: "ai" },
  { tag: "THEN", label: "Rover adds it to the roadmap", icon: Sparkle, tone: "ai" },
  { tag: "THEN", label: "Notify Product team", icon: Bell, tone: "neutral" },
] as const;

const existing = [
  { name: "Weekly executive report", trigger: "Every Friday · 4:00 PM", active: true },
  { name: "Feedback triage", trigger: "On new feedback", active: true },
  { name: "Stale task reminder", trigger: "Daily · 9:00 AM", active: false },
];

export default function AutomationsPage() {
  const toast = useToast();
  const [items, setItems] = useState(existing);

  return (
    <>
      <PageHeader
        title="Automations"
        description="Compose triggers and actions into workflows that run on their own."
        actions={<Button onClick={() => toast.push({ title: "New automation", description: "Opening the workflow builder…", tone: "ai" })}><Plus className="h-4 w-4" /> Build an automation</Button>}
      />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Builder preview */}
          <div className="rounded-2xl border border-line bg-surface p-6">
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-[14px] font-semibold text-ink">Feedback triage</span>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-medium text-success"><StatusDot tone="success" /> Active</span>
            </div>
            <div className="mx-auto flex max-w-sm flex-col items-center">
              {flow.map((s, i) => (
                <div key={i} className="flex w-full flex-col items-center">
                  <div className={`w-full rounded-xl border p-3.5 ${s.tone === "ai" ? "border-accent/20 bg-accent/[0.04]" : "border-line bg-canvas/50"}`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.tone === "ai" ? "bg-accent/10" : "bg-ink/[0.04]"}`}>
                        <s.icon className={`h-4 w-4 ${s.tone === "ai" ? "text-accent" : "text-ink"}`} />
                      </span>
                      <div>
                        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted">{s.tag}</div>
                        <div className="text-[13.5px] font-medium text-ink">{s.label}</div>
                      </div>
                    </div>
                  </div>
                  {i < flow.length - 1 && <ArrowDown className="my-1.5 h-4 w-4 text-muted/50" />}
                </div>
              ))}
            </div>
          </div>

          {/* Existing */}
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted/70">Your automations</div>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={it.name} className="flex items-center justify-between rounded-xl border border-line bg-surface p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink/[0.04]"><Clock className="h-4 w-4 text-muted" /></span>
                    <div>
                      <div className="text-[13.5px] font-medium text-ink">{it.name}</div>
                      <div className="text-[12px] text-muted">{it.trigger}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setItems((p) => p.map((x, j) => (j === i ? { ...x, active: !x.active } : x)))}
                    className={`relative h-5 w-9 rounded-full transition-colors ${it.active ? "bg-accent" : "bg-ink/15"}`}
                    aria-label="Toggle"
                  >
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${it.active ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}
