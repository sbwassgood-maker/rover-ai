"use client";
import { useState } from "react";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { Input, Field, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/Card";
import { Sparkle } from "@/components/brand/Sparkle";
import { useToast } from "@/components/ui/Toast";
import { currentUser, teamMembers, integrations } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const sections = ["General", "Profile", "Workspace", "Members", "Permissions", "AI", "Integrations", "Billing", "Security"];

export default function SettingsPage() {
  const [active, setActive] = useState("Profile");
  const toast = useToast();

  return (
    <>
      <PageHeader title="Settings" description="Manage your workspace, team, AI, and security." />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => setActive(s)}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-2 text-left text-[13.5px] transition-colors",
                  active === s ? "bg-ink/[0.06] font-medium text-ink" : "text-muted hover:bg-ink/5 hover:text-ink"
                )}
              >
                {s}
              </button>
            ))}
          </nav>

          <div className="max-w-2xl">
            {active === "Profile" && (
              <Panel title="Profile" desc="Update your personal information.">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-lg font-semibold text-success">{currentUser.initials}</span>
                    <Button variant="secondary" size="sm">Change avatar</Button>
                  </div>
                  <Field label="Full name"><Input defaultValue={currentUser.fullName} /></Field>
                  <Field label="Email"><Input defaultValue={currentUser.email} /></Field>
                  <Field label="Role"><Input defaultValue={currentUser.role} /></Field>
                  <Button onClick={() => toast.push({ title: "Profile saved" })}>Save changes</Button>
                </div>
              </Panel>
            )}

            {active === "Members" && (
              <Panel title="Members" desc="People in your workspace.">
                <div className="overflow-hidden rounded-xl border border-line">
                  {teamMembers.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ backgroundColor: m.color }}>{m.initials}</span>
                      <div className="flex-1"><div className="text-[13.5px] font-medium text-ink">{m.name}</div><div className="text-[12px] text-muted">{m.role}</div></div>
                      <span className="text-[12px] text-muted">Member</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {active === "AI" && (
              <Panel title="AI" desc="Control what Rover can access and which actions require approval.">
                <div className="space-y-3">
                  {[
                    ["Allow Rover to read workspace content", true],
                    ["Require approval for external actions", true],
                    ["Allow agents to run on a schedule", true],
                    ["Let Rover update documents automatically", false],
                  ].map(([label, on], i) => (
                    <Toggle key={i} label={label as string} defaultOn={on as boolean} />
                  ))}
                </div>
              </Panel>
            )}

            {active === "Integrations" && (
              <Panel title="Integrations" desc="Connect the tools your team already uses.">
                <div className="grid gap-2 sm:grid-cols-2">
                  {integrations.slice(0, 8).map((it) => (
                    <div key={it.name} className="flex items-center justify-between rounded-xl border border-line px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-canvas text-[12px] font-semibold text-ink">{it.glyph}</span>
                        <span className="text-[13.5px] font-medium text-ink">{it.name}</span>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => toast.push({ title: `Connect ${it.name}`, description: "Configure in a real workspace." })}>Connect</Button>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[12px] text-muted">Availability depends on your plan and workspace configuration.</p>
              </Panel>
            )}

            {active === "Security" && (
              <Panel title="Security" desc="Designed for enterprise security requirements.">
                <div className="space-y-3">
                  {[
                    ["Single sign-on (SSO)", "Not configured"],
                    ["Two-factor authentication", "Enabled"],
                    ["Audit logs", "Enabled"],
                    ["Data retention", "Default policy"],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                      <span className="text-[13.5px] text-ink">{label}</span>
                      <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted"><StatusDot tone={val === "Enabled" ? "success" : "muted"} /> {val}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {active === "Workspace" && (
              <Panel title="Workspace" desc="General workspace preferences.">
                <div className="space-y-4">
                  <Field label="Workspace name"><Input defaultValue="Northstar" /></Field>
                  <Field label="Description"><Textarea rows={3} defaultValue="Everything the Northstar team knows, in one intelligent workspace." /></Field>
                  <Button onClick={() => toast.push({ title: "Workspace updated" })}>Save</Button>
                </div>
              </Panel>
            )}

            {["General", "Permissions", "Billing"].includes(active) && (
              <Panel title={active} desc="Settings for this section.">
                <div className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
                  <Sparkle size={18} className="mx-auto mb-2" />
                  {active} settings are illustrative in this demo.
                </div>
              </Panel>
            )}
          </div>
        </div>
      </PageBody>
    </>
  );
}

function Panel({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-0.5 text-[13.5px] text-muted">{desc}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Toggle({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
      <span className="text-[13.5px] text-ink">{label}</span>
      <button
        onClick={() => setOn((v) => !v)}
        className={cn("relative h-5 w-9 rounded-full transition-colors", on ? "bg-accent" : "bg-ink/15")}
        aria-label="Toggle"
      >
        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", on ? "left-[18px]" : "left-0.5")} />
      </button>
    </div>
  );
}
