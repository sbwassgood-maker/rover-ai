"use client";
import { useState } from "react";
import { Plus, Play, Pause, Trash2, Check, Clock, MoreHorizontal } from "lucide-react";
import { Sparkle } from "@/components/brand/Sparkle";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { agents as seedAgents, agentStatusMeta, type Agent } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const dataSources = ["Projects", "Docs", "Meetings", "Customer feedback"];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(seedAgents);
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState(false);
  const [name, setName] = useState("Weekly Executive Brief");
  const [menu, setMenu] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(dataSources);
  const toast = useToast();

  const toggleSource = (s: string) =>
    setSelected((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const create = () => {
    setCreated(true);
    setAgents((prev) => [
      { id: `a-${Date.now()}`, name, description: "Custom agent created from the builder.", status: "scheduled", lastRun: "—", nextRun: "Mon, 8:00 AM", completed: 0, schedule: "Every Monday · 8:00 AM" },
      ...prev,
    ]);
  };

  const togglePause = (id: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "paused" ? "active" : "paused" } : a
      )
    );
    setMenu(null);
  };

  const remove = (id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
    setMenu(null);
    toast.push({ title: "Agent deleted" });
  };

  const run = (name: string) => {
    setMenu(null);
    toast.push({ title: `Running ${name}…`, description: "You'll be notified when it finishes.", tone: "ai" });
  };

  return (
    <>
      <PageHeader
        title="Agents"
        description="AI agents that understand your workspace and handle recurring work."
        actions={
          <Button variant="ai" onClick={() => { setOpen(true); setCreated(false); }}>
            <Plus className="h-4 w-4" /> Create agent
          </Button>
        }
      />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2">
          {agents.map((a) => {
            const meta = agentStatusMeta[a.status];
            return (
              <div key={a.id} className="relative flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkle size={16} />
                    <h3 className="text-[15px] font-semibold text-ink">{a.name}</h3>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMenu(menu === a.id ? null : a.id)}
                      className="rounded-md p-1 text-muted hover:bg-ink/5"
                      aria-label="Agent actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {menu === a.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                        <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-float animate-scale-in">
                          <MenuItem icon={Play} onClick={() => run(a.name)}>Run now</MenuItem>
                          <MenuItem icon={Pause} onClick={() => togglePause(a.id)}>
                            {a.status === "paused" ? "Resume" : "Pause"}
                          </MenuItem>
                          <MenuItem icon={Trash2} danger onClick={() => remove(a.id)}>Delete</MenuItem>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-muted">{a.description}</p>

                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink">
                    <StatusDot tone={meta.tone} pulse={a.status === "working"} /> {meta.label}
                  </span>
                  <span className="text-[12px] text-muted">{a.completed} tasks · Next {a.nextRun}</span>
                </div>
              </div>
            );
          })}
        </div>
      </PageBody>

      <Modal open={open} onClose={() => setOpen(false)} title={created ? "" : "Create an agent"}>
        {created ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/12">
              <Check className="h-6 w-6 text-success" strokeWidth={2.5} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-ink">Agent created</h3>
            <p className="mt-1.5 text-sm text-muted">
              Your {name} will run every Monday at 8:00 AM.
            </p>
            <Button variant="secondary" className="mt-6" onClick={() => setOpen(false)}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4 p-5">
            <Field label="Agent name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="What should it do?">
              <Textarea rows={4} defaultValue="Every Monday, review company metrics, project updates, customer feedback and important meetings. Then create a concise executive briefing." />
            </Field>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-ink">Data sources</span>
              <div className="flex flex-wrap gap-2">
                {dataSources.map((s) => {
                  const on = selected.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSource(s)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                        on ? "border-accent/30 bg-accent/10 text-accent" : "border-line text-muted hover:border-ink/20"
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
                <Clock className="h-4 w-4 text-muted" /> Every Monday · 8:00 AM
              </div>
            </Field>
            <Button variant="ai" className="w-full" onClick={create}>
              <Sparkle size={14} className="text-white" /> Create Agent
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}

function MenuItem({
  icon: Icon,
  children,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-ink/5",
        danger ? "text-error" : "text-ink"
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {children}
    </button>
  );
}
