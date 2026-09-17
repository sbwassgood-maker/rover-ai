"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Eye, Zap, Bot, LayoutTemplate, ArrowRight, Sparkles } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { Sparkle } from "@/components/brand/Sparkle";
import { Button } from "@/components/ui/Button";
import { useRoverState } from "@/rover/useRover";
import { detectPatterns } from "@/rover/shadow";
import { getOrchestrator } from "@/rover/orchestrator";
import { useToast } from "@/components/ui/Toast";
import type { ShadowSuggestion } from "@/rover/types";

const kindMeta = {
  automation: { icon: Zap, label: "Automation" },
  agent: { icon: Bot, label: "Agent" },
  template: { icon: LayoutTemplate, label: "Template" },
};

export default function ShadowPage() {
  const s = useRoverState();
  const router = useRouter();
  const toast = useToast();
  const suggestions = useMemo(() => detectPatterns(s), [s]);

  const convert = (sug: ShadowSuggestion) => {
    const mission = getOrchestrator().createMission({ rawGoal: sug.goal });
    getOrchestrator().runMission(mission.id);
    toast.push({ title: "Mission launched from suggestion", tone: "ai" });
    router.push(`/app/missions/${mission.id}`);
  };

  return (
    <>
      <PageHeader
        title="Shadow Rover"
        description="Read-only observation. Rover watches how your team works and suggests automations — it never changes anything on its own."
      />
      <PageBody>
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.05] to-transparent p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10"><Eye className="h-4.5 w-4.5 text-accent" /></span>
            <div>
              <div className="text-[13.5px] font-semibold text-ink">I noticed {suggestions.length} recurring pattern{suggestions.length !== 1 ? "s" : ""}.</div>
              <p className="text-[12.5px] text-muted">Convert any of these into a mission with one click. Nothing runs until you choose.</p>
            </div>
          </div>

          <div className="space-y-3">
            {suggestions.map((sug) => {
              const meta = kindMeta[sug.kind];
              return (
                <div key={sug.id} className="rounded-2xl border border-line bg-surface p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink/[0.04]"><meta.icon className="h-4 w-4 text-ink" /></span>
                      <div>
                        <h3 className="text-[15px] font-semibold text-ink">{sug.title}</h3>
                        <span className="text-[11.5px] font-medium uppercase tracking-wider text-muted">{meta.label} · {Math.round(sug.confidence * 100)}% confidence</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-[13px] text-muted"><span className="font-medium text-ink/80">Observed:</span> {sug.observation}</p>
                  <p className="mt-1.5 flex items-start gap-1.5 text-[13px] text-ink/85"><Sparkle size={13} className="mt-0.5 shrink-0" /> {sug.suggestion}</p>
                  <div className="mt-3">
                    <Button size="sm" variant="ai" onClick={() => convert(sug)}><Sparkles className="h-4 w-4" /> Turn into a mission <ArrowRight className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PageBody>
    </>
  );
}
