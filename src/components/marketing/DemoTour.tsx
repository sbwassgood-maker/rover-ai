"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play, Pause, X, RotateCcw, ArrowRight, Search, Check, FileText,
  Sparkles, Bot, ArrowUp,
} from "lucide-react";
import { RoverMark } from "@/components/brand/Logo";
import { Sparkle } from "@/components/brand/Sparkle";
import { Typewriter, ThinkingDots } from "@/components/ui/Typewriter";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Scene = { id: string; label: string; caption: string; duration: number };

const scenes: Scene[] = [
  { id: "ask", label: "Ask Rover", caption: "Ask anything across your workspace and get answers with sources.", duration: 6500 },
  { id: "search", label: "Search", caption: "One search across docs, projects, meetings and connected tools.", duration: 6500 },
  { id: "docs", label: "Docs", caption: "Write with an AI partner that understands your context.", duration: 6000 },
  { id: "agents", label: "Agents", caption: "Turn recurring work into agents that run on their own.", duration: 6000 },
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
            <span className="text-[13px] text-white/50">· ~30 sec</span>
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
      {scene === "ask" && <AskScene />}
      {scene === "search" && <SearchScene />}
      {scene === "docs" && <DocsScene />}
      {scene === "agents" && <AgentsScene />}
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
              <Typewriter text="I found 6 active blockers across Engineering and Product." speed={22} />
            </p>
            <div className="mt-2.5 space-y-1.5">
              {[["API migration", "Fri"], ["Mobile onboarding", "Mon"], ["Billing integration", "Tue"]].map(([n, d], i) => (
                <div key={n} className="flex items-center justify-between rounded-lg border border-line bg-canvas/60 px-2.5 py-1.5 text-[12.5px] animate-fade-up" style={{ animationDelay: `${900 + i * 220}ms` }}>
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
            <div key={r} className="flex items-center gap-2 text-[12.5px] text-ink animate-fade-up" style={{ animationDelay: `${300 + i * 260}ms` }}>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-white"><Check className="h-3 w-3" strokeWidth={3} /></span>
              {r}
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-accent/20 bg-gradient-to-br from-accent/[0.06] to-transparent p-3 animate-fade-up" style={{ animationDelay: "1500ms" }}>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent"><Sparkle size={12} /> Answer</div>
          <p className="mt-1 text-[13px] text-ink">
            <Typewriter text="The team chose three tiers, with Team at $20/user/month as the recommended plan." speed={18} start />
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
            <p><Typewriter text="Our Q4 strategy focuses on improving activation, retention, and expansion." speed={16} /></p>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-canvas/60 p-3">
          <div className="flex items-center gap-1.5"><Sparkle size={13} /><span className="text-[12px] font-semibold text-ink">Rover</span></div>
          <div className="mt-2 space-y-1.5">
            {["Create summary", "Turn into roadmap", "Extract tasks"].map((a, i) => (
              <div key={a} className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink animate-fade-up" style={{ animationDelay: `${500 + i * 260}ms` }}>
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
          <div key={c.n} className="rounded-xl border border-line bg-surface p-3 shadow-sm animate-fade-up" style={{ animationDelay: `${i * 200}ms` }}>
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
