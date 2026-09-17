"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play, Pause, X, RotateCcw, Search, Check, FileText,
  Sparkles, Bot, Table2, Zap, CalendarDays, ShieldCheck, ArrowDown,
  Mail, Database, ShoppingCart,
} from "lucide-react";
import { RoverMark } from "@/components/brand/Logo";
import { Sparkle } from "@/components/brand/Sparkle";
import { Typewriter } from "@/components/ui/Typewriter";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Scene = { id: string; label: string; caption: string; duration: number };

const scenes: Scene[] = [
  { id: "intro", label: "Welcome", caption: "Everything your team knows, in one intelligent workspace.", duration: 2600 },
  { id: "ask", label: "Ask Rover", caption: "Ask anything across your workspace and get answers with sources.", duration: 4200 },
  { id: "search", label: "Search", caption: "One search across docs, projects, meetings and connected tools.", duration: 4200 },
  { id: "docs", label: "Docs", caption: "Write with an AI partner that understands your context.", duration: 3800 },
  { id: "databases", label: "Databases", caption: "Turn structured data into insight with one click.", duration: 4000 },
  { id: "agents", label: "Agents", caption: "Turn recurring work into agents that run on their own.", duration: 3600 },
  { id: "automations", label: "Automations", caption: "Compose triggers and actions into workflows that run themselves.", duration: 4000 },
  { id: "meetings", label: "Meetings", caption: "Every meeting becomes searchable knowledge.", duration: 3800 },
  { id: "control", label: "You're in control", caption: "AI does the work—you approve anything that touches the outside world.", duration: 4000 },
];

/**
 * Interactive product tour used by the "Watch demo" CTA.
 *
 * This is a real, animated UI walkthrough (not a video file). To use an actual
 * recorded video instead, pass `videoSrc` (an mp4 URL) or `embedUrl`
 * (a YouTube/Loom embed URL) and it will render that in the player instead.
 */
export function DemoTour({
  open,
  onClose,
  videoSrc,
  embedUrl,
}: {
  open: boolean;
  onClose: () => void;
  videoSrc?: string;
  embedUrl?: string;
}) {
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);
  const raf = useRef<number | null>(null);
  const startedAt = useRef<number>(0);
  const elapsedBefore = useRef<number>(0);

  const hasRealVideo = Boolean(videoSrc || embedUrl);
  const total = useMemo(() => scenes.reduce((s, x) => s + x.duration, 0), []);

  // Reset when opened
  useEffect(() => {
    if (open) {
      setScene(0);
      setPlaying(true);
      setProgress(0);
      setFinished(false);
      elapsedBefore.current = 0;
    }
  }, [open]);

  // Drive the animation timeline
  useEffect(() => {
    if (!open || hasRealVideo || !playing || finished) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      // Show all captions statically; do not auto-advance aggressively.
      return;
    }

    startedAt.current = performance.now();
    const dur = scenes[scene].duration;

    const tick = (now: number) => {
      const elapsed = now - startedAt.current + elapsedBefore.current;
      setProgress(Math.min(elapsed / dur, 1));
      if (elapsed >= dur) {
        elapsedBefore.current = 0;
        if (scene < scenes.length - 1) {
          setScene((s) => s + 1);
        } else {
          setFinished(true);
          setPlaying(false);
        }
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      // Preserve elapsed when pausing mid-scene
      elapsedBefore.current += performance.now() - startedAt.current;
    };
  }, [open, playing, scene, finished, hasRealVideo]);

  // Keyboard controls
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
      if (e.key === "ArrowRight") goTo(Math.min(scene + 1, scenes.length - 1));
      if (e.key === "ArrowLeft") goTo(Math.max(scene - 1, 0));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scene]);

  const goTo = (i: number) => {
    elapsedBefore.current = 0;
    setFinished(false);
    setPlaying(true);
    setProgress(0);
    setScene(i);
  };

  const restart = () => goTo(0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-md animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-4xl animate-scale-in">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/90">
            <RoverMark size={20} className="text-white" />
            <span className="text-[14px] font-medium">Product tour</span>
            <span className="text-[13px] text-white/50">· {scenes.length} chapters · ~{Math.round(total / 1000)} sec</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close demo"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Player */}
        <div className="overflow-hidden rounded-2xl border border-night-line bg-night-surface shadow-float">
          {hasRealVideo ? (
            <div className="aspect-video w-full bg-black">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Rover AI demo"
                />
              ) : (
                <video src={videoSrc} className="h-full w-full" controls autoPlay />
              )}
            </div>
          ) : (
            <div className="relative aspect-video w-full overflow-hidden bg-canvas">
              <DemoStage scene={scenes[scene].id} sceneIndex={scene} />
              {/* Caption overlay */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4 pt-10">
                <div className="flex items-center gap-2 text-white">
                  <Sparkle size={14} className="text-accent-soft" />
                  <span className="text-[13px] font-semibold uppercase tracking-wider text-white/70">
                    {scenes[scene].label}
                  </span>
                </div>
                <p className="mt-1 max-w-lg text-[15px] font-medium text-white">
                  {scenes[scene].caption}
                </p>
              </div>

              {/* Finished overlay */}
              {finished && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/70 backdrop-blur-sm animate-fade-in">
                  <RoverMark size={40} className="text-white" />
                  <p className="text-center text-lg font-semibold text-white">
                    That&rsquo;s Rover AI.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <ButtonLink href="/onboarding" variant="dark" size="md">
                      Start for free
                    </ButtonLink>
                    <button
                      onClick={restart}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                      <RotateCcw className="h-4 w-4" /> Replay
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          {!hasRealVideo && (
            <div className="flex items-center gap-3 border-t border-night-line px-4 py-3">
              <button
                onClick={() => (finished ? restart() : setPlaying((p) => !p))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-transform hover:scale-105"
                aria-label={finished ? "Replay" : playing ? "Pause" : "Play"}
              >
                {finished ? <RotateCcw className="h-4 w-4" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
              </button>

              {/* Segmented progress */}
              <div className="flex flex-1 items-center gap-1.5">
                {scenes.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => goTo(i)}
                    className="group relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/15"
                    aria-label={`Go to ${s.label}`}
                  >
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-white transition-[width]"
                      style={{
                        width: i < scene ? "100%" : i === scene ? `${progress * 100}%` : "0%",
                      }}
                    />
                  </button>
                ))}
              </div>

              <span className="hidden shrink-0 text-[12px] text-white/50 sm:block">
                {scene + 1} / {scenes.length}
              </span>
            </div>
          )}
        </div>

        {/* Scene tabs */}
        {!hasRealVideo && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            {scenes.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                  i === scene && !finished
                    ? "bg-white text-ink"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Animated scenes — reuse the workspace aesthetic                   */
/* ---------------------------------------------------------------- */

function DemoStage({ scene, sceneIndex }: { scene: string; sceneIndex: number }) {
  return (
    <div key={sceneIndex} className="absolute inset-0 animate-fade-in">
      {scene === "intro" && <IntroScene />}
      {scene === "ask" && <AskScene />}
      {scene === "search" && <SearchScene />}
      {scene === "docs" && <DocsScene />}
      {scene === "databases" && <DatabasesScene />}
      {scene === "agents" && <AgentsScene />}
      {scene === "automations" && <AutomationsScene />}
      {scene === "meetings" && <MeetingsScene />}
      {scene === "control" && <ControlScene />}
    </div>
  );
}

function Chrome({ children, icon: Icon, title }: { children: React.ReactNode; icon: React.ElementType; title: string }) {
  return (
    <div className="flex h-full flex-col p-4 sm:p-6">
      <div className="mb-3 flex items-center gap-2 text-muted">
        <Icon className="h-4 w-4 text-accent" />
        <span className="text-[12.5px] font-semibold uppercase tracking-wider">{title}</span>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

function AskScene() {
  return (
    <Chrome icon={Sparkles} title="Ask Rover">
      <div className="mx-auto flex h-full max-w-lg flex-col justify-center">
        <div className="flex items-start justify-end gap-2">
          <div className="rounded-2xl rounded-tr-md bg-ink px-3.5 py-2 text-[13.5px] text-white">
            What are our biggest product blockers this week?
          </div>
          <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-[10px] font-semibold text-success">AM</span>
        </div>
        <div className="mt-3 flex items-start gap-2">
          <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent/10"><Sparkle size={13} /></span>
          <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-line bg-surface p-3 shadow-sm">
            <p className="text-[13.5px] text-ink">
              <Typewriter text="I found 6 active blockers across Engineering and Product." speed={10} />
            </p>
            <div className="mt-2.5 space-y-1.5">
              {[["API migration", "Fri"], ["Mobile onboarding", "Mon"], ["Billing integration", "Tue"]].map(([n, d], i) => (
                <div key={n} className="flex items-center justify-between rounded-lg border border-line bg-canvas/60 px-2.5 py-1.5 text-[12.5px] animate-fade-up" style={{ animationDelay: `${500 + i * 130}ms` }}>
                  <span className="flex items-center gap-1.5 font-medium text-ink"><FileText className="h-3.5 w-3.5 text-muted" /> {n}</span>
                  <span className="text-muted">Due {d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Chrome>
  );
}

function SearchScene() {
  const rows = ["34 documents", "12 project pages", "486 meeting notes", "2 connected apps"];
  return (
    <Chrome icon={Search} title="Workspace search">
      <div className="mx-auto flex h-full max-w-lg flex-col justify-center">
        <div className="flex items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5 shadow-sm">
          <Search className="h-4 w-4 text-muted" />
          <span className="text-[13.5px] text-ink">What did we decide about Q4 pricing?</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {rows.map((r, i) => (
            <div key={r} className="flex items-center gap-2 text-[12.5px] text-ink animate-fade-up" style={{ animationDelay: `${150 + i * 130}ms` }}>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-white"><Check className="h-3 w-3" strokeWidth={3} /></span>
              {r}
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-accent/20 bg-gradient-to-br from-accent/[0.06] to-transparent p-3 animate-fade-up" style={{ animationDelay: "800ms" }}>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent"><Sparkle size={12} /> Answer</div>
          <p className="mt-1 text-[13px] text-ink">
            <Typewriter text="The team chose three tiers, with Team at $20/user/month as the recommended plan." speed={9} start />
          </p>
        </div>
      </div>
    </Chrome>
  );
}

function DocsScene() {
  return (
    <Chrome icon={FileText} title="Documents">
      <div className="mx-auto grid h-full max-w-xl grid-cols-[1.6fr_1fr] gap-3">
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="text-lg font-semibold tracking-tight text-ink">Q4 Product Strategy</div>
          <div className="mt-3 space-y-2 text-[12.5px] text-muted">
            <div className="font-semibold text-ink">Overview</div>
            <p><Typewriter text="Our Q4 strategy focuses on improving activation, retention, and expansion." speed={9} /></p>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-canvas/60 p-3">
          <div className="flex items-center gap-1.5"><Sparkle size={13} /><span className="text-[12px] font-semibold text-ink">Rover</span></div>
          <div className="mt-2 space-y-1.5">
            {["Create summary", "Turn into roadmap", "Extract tasks"].map((a, i) => (
              <div key={a} className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink animate-fade-up" style={{ animationDelay: `${250 + i * 150}ms` }}>
                <Sparkle size={11} /> {a}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Chrome>
  );
}

function AgentsScene() {
  const cards = [
    { n: "Weekly Executive Brief", s: "Scheduled" },
    { n: "Customer Insights", s: "Active" },
    { n: "Research Agent", s: "Working" },
    { n: "Content Agent", s: "Active" },
  ];
  return (
    <Chrome icon={Bot} title="AI agents">
      <div className="mx-auto grid h-full max-w-lg grid-cols-2 content-center gap-2.5">
        {cards.map((c, i) => (
          <div key={c.n} className="rounded-xl border border-line bg-surface p-3 shadow-sm animate-fade-up" style={{ animationDelay: `${i * 110}ms` }}>
            <div className="flex items-center gap-1.5"><Sparkle size={13} /><span className="text-[12.5px] font-semibold text-ink">{c.n}</span></div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink">
              <span className={cn("h-1.5 w-1.5 rounded-full", c.s === "Working" ? "bg-warning animate-pulse-dot" : c.s === "Scheduled" ? "bg-accent" : "bg-success")} />
              {c.s}
            </div>
          </div>
        ))}
      </div>
    </Chrome>
  );
}


function IntroScene() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-night">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_10%,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-[110px]" />
      <div className="relative flex flex-col items-center animate-scale-in">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-night-line bg-night-surface">
          <RoverMark size={30} className="text-white" />
        </div>
        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tracking-tight text-white">rover</span>
          <span className="text-lg font-semibold text-accent-soft">AI</span>
        </div>
        <p className="mt-2 text-[13.5px] text-white/60">Your intelligent workspace</p>
      </div>
    </div>
  );
}

function DatabasesScene() {
  const rows = [
    { n: "Website", s: "Active", tone: "bg-success", i: "2 blockers" },
    { n: "Mobile App", s: "On track", tone: "bg-success", i: "Launch ready" },
    { n: "CRM", s: "Blocked", tone: "bg-error", i: "API issue" },
  ];
  return (
    <Chrome icon={Table2} title="Databases">
      <div className="mx-auto flex h-full max-w-lg flex-col justify-center">
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-line text-[11px] text-muted">
              <tr><th className="px-3 py-2 font-medium">Project</th><th className="px-3 py-2 font-medium">Status</th><th className="px-3 py-2 font-medium">AI Insight</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.n} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 font-medium text-ink">{r.n}</td>
                  <td className="px-3 py-2"><span className="inline-flex items-center gap-1.5 text-ink/80"><span className={cn("h-1.5 w-1.5 rounded-full", r.tone)} /> {r.s}</span></td>
                  <td className="px-3 py-2"><span className="inline-flex items-center gap-1 text-accent"><Sparkle size={10} /> {r.i}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 rounded-xl border border-accent/20 bg-gradient-to-br from-accent/[0.06] to-transparent p-3 animate-fade-up" style={{ animationDelay: "500ms" }}>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent"><Sparkle size={12} /> AI analysis</div>
          <p className="mt-1 text-[13px] text-ink">
            <Typewriter text="3 projects are at risk. The CRM migration is highest priority—its dependency is blocking two teams." speed={9} start />
          </p>
        </div>
      </div>
    </Chrome>
  );
}

function AutomationsScene() {
  const steps = [
    { tag: "WHEN", label: "Every Friday · 4:00 PM", ai: false },
    { tag: "THEN", label: "Rover reads metrics & feedback", ai: true },
    { tag: "THEN", label: "Rover drafts the weekly report", ai: true },
    { tag: "THEN", label: "Send to leadership", ai: false },
  ];
  return (
    <Chrome icon={Zap} title="Automations">
      <div className="mx-auto flex h-full max-w-sm flex-col justify-center">
        {steps.map((s, i) => (
          <div key={i} className="flex w-full flex-col items-center">
            <div
              className={cn(
                "w-full rounded-xl border p-2.5 animate-fade-up",
                s.ai ? "border-accent/20 bg-accent/[0.05]" : "border-line bg-surface"
              )}
              style={{ animationDelay: `${i * 170}ms` }}
            >
              <div className="flex items-center gap-2.5">
                <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", s.ai ? "bg-accent/10" : "bg-ink/[0.04]")}>
                  {s.ai ? <Sparkle size={13} /> : <Zap className="h-3.5 w-3.5 text-ink" />}
                </span>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{s.tag}</div>
                  <div className="text-[12.5px] font-medium text-ink">{s.label}</div>
                </div>
              </div>
            </div>
            {i < steps.length - 1 && <ArrowDown className="my-1 h-3.5 w-3.5 text-muted/40" />}
          </div>
        ))}
      </div>
    </Chrome>
  );
}

function MeetingsScene() {
  return (
    <Chrome icon={CalendarDays} title="Meetings">
      <div className="mx-auto flex h-full max-w-lg flex-col justify-center">
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-ink">Product Strategy</span>
            <span className="text-[11.5px] text-muted">Sep 17 · 10:00 AM</span>
          </div>
          <div className="mt-3 text-[11px] font-semibold text-ink">Summary</div>
          <p className="mt-1 text-[12.5px] text-muted">
            <Typewriter text="The team agreed to prioritize onboarding for Q4 and set the launch for April 14." speed={9} start />
          </p>
          <div className="mt-3 text-[11px] font-semibold text-ink">Action items</div>
          <ul className="mt-1.5 space-y-1">
            {[["Sarah", "Draft onboarding proposal"], ["Alex", "Review analytics"], ["Mike", "Estimate effort"]].map(([who, what], i) => (
              <li key={who} className="flex items-center gap-1.5 text-[12px] text-ink/80 animate-fade-up" style={{ animationDelay: `${350 + i * 140}ms` }}>
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border border-line" />
                <span className="rounded bg-ink/[0.05] px-1.5 py-0.5 text-[11px] font-medium text-ink">{who}</span>
                <span className="text-muted/50">→</span> {what}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Chrome>
  );
}

function ControlScene() {
  const [decided, setDecided] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDecided(true), 1500);
    return () => clearTimeout(t);
  }, []);
  const requests = [
    { icon: Mail, title: "Send campaign email", detail: "428 recipients" },
    { icon: Database, title: "Update 17 customer records", detail: "Salesforce" },
    { icon: ShoppingCart, title: "Create purchase order", detail: "$12,400" },
  ];
  return (
    <Chrome icon={ShieldCheck} title="Human control">
      <div className="mx-auto flex h-full max-w-md flex-col justify-center">
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-1.5"><Sparkle size={13} /><span className="text-[12.5px] font-semibold text-ink">Rover wants to:</span></div>
          <div className="mt-2.5 space-y-1.5">
            {requests.map((r) => (
              <div key={r.title} className="flex items-center gap-2.5 rounded-lg border border-line bg-canvas/50 px-2.5 py-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink/[0.04]"><r.icon className="h-3.5 w-3.5 text-ink" /></span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium text-ink">{r.title}</div>
                  <div className="text-[11px] text-muted">{r.detail}</div>
                </div>
              </div>
            ))}
          </div>
          {!decided ? (
            <div className="mt-3 flex gap-1.5">
              <div className="flex-1 rounded-lg border border-line py-1.5 text-center text-[12.5px] font-medium text-ink">Review</div>
              <div className="flex-1 rounded-lg bg-ink py-1.5 text-center text-[12.5px] font-medium text-white">Approve</div>
              <div className="rounded-lg border border-line px-3 py-1.5 text-center text-[12.5px] font-medium text-error">Reject</div>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-[12.5px] font-medium text-success animate-fade-in">
              <Check className="h-4 w-4" /> Approved — Rover will proceed.
            </div>
          )}
        </div>
      </div>
    </Chrome>
  );
}
