"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Users, Library, FolderKanban, Bot, Check, ArrowRight, ArrowLeft,
  FileText, Sparkles, Download,
} from "lucide-react";
import { Logo, RoverMark } from "@/components/brand/Logo";
import { Sparkle } from "@/components/brand/Sparkle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const purposes = [
  { id: "personal", label: "Personal productivity", icon: User },
  { id: "team", label: "Team workspace", icon: Users },
  { id: "knowledge", label: "Company knowledge", icon: Library },
  { id: "projects", label: "Project management", icon: FolderKanban },
  { id: "automation", label: "AI automation", icon: Bot },
];

const starts = [
  { id: "doc", label: "Create a document", icon: FileText, href: "/app/docs/new" },
  { id: "ask", label: "Ask Rover", icon: Sparkles, href: "/app/ask", ai: true },
  { id: "import", label: "Import knowledge", icon: Download, href: "/app" },
  { id: "project", label: "Create a project", icon: FolderKanban, href: "/app/projects" },
  { id: "agent", label: "Create an agent", icon: Bot, href: "/app/agents" },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [purpose, setPurpose] = useState<string | null>("team");
  const [workspace, setWorkspace] = useState("Northstar");

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-5 py-10">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_50%_50%_at_50%_30%,#000_10%,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[600px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative w-full max-w-lg">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/"><Logo size={24} /></Link>
          <span className="text-[13px] text-muted">Step {step + 1} of 3</span>
        </div>

        {/* Progress */}
        <div className="mb-8 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-accent" : "bg-line")} />
          ))}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
          {step === 0 && (
            <div className="animate-fade-in">
              <div className="mb-1 flex items-center gap-2">
                <RoverMark size={22} className="text-ink" />
                <h1 className="text-xl font-semibold text-ink">Welcome to Rover</h1>
              </div>
              <p className="text-[14px] text-muted">What are you using Rover for?</p>
              <div className="mt-5 space-y-2">
                {purposes.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPurpose(p.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                      purpose === p.id ? "border-accent/40 bg-accent/[0.05]" : "border-line hover:border-ink/20"
                    )}
                  >
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg border", purpose === p.id ? "border-accent/30 bg-accent/10" : "border-line bg-canvas")}>
                      <p.icon className={cn("h-4.5 w-4.5", purpose === p.id ? "text-accent" : "text-ink")} />
                    </span>
                    <span className="flex-1 text-[14px] font-medium text-ink">{p.label}</span>
                    {purpose === p.id && <Check className="h-4 w-4 text-accent" strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
              <Button className="mt-6 w-full" onClick={next} disabled={!purpose}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in">
              <h1 className="text-xl font-semibold text-ink">Create your workspace</h1>
              <p className="text-[14px] text-muted">This is where your team&rsquo;s knowledge lives.</p>
              <div className="mt-5">
                <label className="mb-1.5 block text-[13px] font-medium text-ink">Workspace name</label>
                <Input value={workspace} onChange={(e) => setWorkspace(e.target.value)} placeholder="Acme Inc." className="h-11" />
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-canvas/50 p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-[13px] font-semibold text-white">
                  {workspace ? workspace[0].toUpperCase() : "W"}
                </span>
                <div>
                  <div className="text-[13.5px] font-medium text-ink">{workspace || "Your workspace"}</div>
                  <div className="text-[12px] text-muted">rover.ai/{(workspace || "workspace").toLowerCase().replace(/\s+/g, "-")}</div>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="secondary" onClick={back}><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button className="flex-1" onClick={next} disabled={!workspace.trim()}>Continue <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h1 className="text-xl font-semibold text-ink">Choose your starting point</h1>
              <p className="text-[14px] text-muted">You can do anything later—this just gets you going.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {starts.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => router.push(s.href)}
                    className="group flex flex-col items-start gap-2 rounded-xl border border-line p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card"
                  >
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg border", s.ai ? "border-accent/30 bg-accent/5" : "border-line bg-canvas")}>
                      <s.icon className={cn("h-4.5 w-4.5", s.ai ? "text-accent" : "text-ink")} />
                    </span>
                    <span className="text-[13.5px] font-medium text-ink">{s.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="secondary" onClick={back}><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button variant="ai" className="flex-1" onClick={() => router.push("/app")}>
                  <Sparkle size={14} className="text-white" /> Enter workspace
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-[12px] text-muted">
          Already have an account? <Link href="/login" className="font-medium text-ink hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}
