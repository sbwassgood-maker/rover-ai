"use client";
import { useEffect, useRef, useState } from "react";
import {
  Type, Heading1, Table2, Database, Quote, Sparkles, CheckSquare, Minus,
  MessageSquare, Sparkle as SparkleIcon, X,
} from "lucide-react";
import { Sparkle } from "@/components/brand/Sparkle";
import { ThinkingDots } from "@/components/ui/Typewriter";
import { cn } from "@/lib/utils";

type Block = { id: number; kind: "h1" | "h2" | "text" | "quote" | "check" | "divider"; text: string; done?: boolean };

const slashItems: { kind: string; label: string; icon: React.ElementType; hint: string; ai?: boolean }[] = [
  { kind: "text", label: "Text", icon: Type, hint: "Plain paragraph" },
  { kind: "h1", label: "Heading", icon: Heading1, hint: "Large section heading" },
  { kind: "check", label: "Checklist", icon: CheckSquare, hint: "To-do item" },
  { kind: "quote", label: "Quote", icon: Quote, hint: "Callout quote" },
  { kind: "table", label: "Table", icon: Table2, hint: "Insert a table" },
  { kind: "database", label: "Database", icon: Database, hint: "Inline database" },
  { kind: "divider", label: "Divider", icon: Minus, hint: "Section break" },
  { kind: "ai", label: "Ask Rover", icon: Sparkles, hint: "Generate with AI", ai: true },
];

export function DocEditor({
  title: initialTitle,
  blocks: initialBlocks,
}: {
  title: string;
  blocks: Block[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [slash, setSlash] = useState<{ id: number } | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  const update = (id: number, patch: Partial<Block>) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const addBlock = (afterId: number, kind: Block["kind"]) => {
    const nb: Block = { id: Date.now(), kind, text: "" };
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === afterId);
      const copy = [...prev];
      copy.splice(i + 1, 0, nb);
      return copy;
    });
    setSlash(null);
  };

  return (
    <div className="flex h-full">
      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-3xl font-semibold tracking-tight text-ink outline-none placeholder:text-muted/40"
            placeholder="Untitled"
          />
          <div className="mt-2 flex items-center gap-2 text-[12.5px] text-muted">
            <span>Edited just now</span>
            <span>·</span>
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className="inline-flex items-center gap-1 font-medium text-accent"
            >
              <Sparkle size={12} /> {panelOpen ? "Hide" : "Show"} Rover
            </button>
          </div>

          <div className="mt-6 space-y-1">
            {blocks.map((b) => (
              <BlockRow
                key={b.id}
                block={b}
                onChange={(patch) => update(b.id, patch)}
                onSlash={() => setSlash({ id: b.id })}
                onEnter={() => addBlock(b.id, "text")}
              />
            ))}
          </div>

          <p className="mt-8 text-[12.5px] text-muted/70">
            Type <kbd className="rounded border border-line bg-canvas px-1 text-[11px]">/</kbd> to insert blocks. This is a demo editor with illustrative content.
          </p>
        </div>
      </div>

      {/* Slash menu */}
      {slash && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSlash(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-64 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-float animate-scale-in">
            <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted/70">
              Insert
            </div>
            {slashItems.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  if (s.kind === "ai") { update(slash.id, { text: "Rover, summarize this document" }); setSlash(null); }
                  else addBlock(slash.id, (s.kind === "table" || s.kind === "database" ? "text" : s.kind) as Block["kind"]);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-ink/[0.04]"
              >
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg border border-line", s.ai ? "bg-accent/5" : "bg-canvas")}>
                  <s.icon className={cn("h-4 w-4", s.ai ? "text-accent" : "text-ink")} />
                </span>
                <span>
                  <span className="block text-[13.5px] font-medium text-ink">{s.label}</span>
                  <span className="block text-[11.5px] text-muted">{s.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* AI panel */}
      {panelOpen && <AIDocPanel onClose={() => setPanelOpen(false)} />}
    </div>
  );
}

function BlockRow({
  block,
  onChange,
  onSlash,
  onEnter,
}: {
  block: Block;
  onChange: (patch: Partial<Block>) => void;
  onSlash: () => void;
  onEnter: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [block.text]);

  if (block.kind === "divider") return <hr className="my-3 border-line" />;

  const styles: Record<string, string> = {
    h1: "text-xl font-semibold text-ink",
    h2: "text-lg font-semibold text-ink",
    text: "text-[15px] text-ink/85 leading-relaxed",
    quote: "text-[15px] text-muted italic border-l-2 border-accent/40 pl-3",
    check: "text-[15px] text-ink/85",
  };

  return (
    <div className="group flex items-start gap-2">
      {block.kind === "check" && (
        <button
          onClick={() => onChange({ done: !block.done })}
          className={cn(
            "mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border",
            block.done ? "border-success bg-success" : "border-line"
          )}
        >
          {block.done && <span className="h-1.5 w-1.5 rounded-[2px] bg-white" />}
        </button>
      )}
      <textarea
        ref={ref}
        rows={1}
        value={block.text}
        onChange={(e) => onChange({ text: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "/" && block.text === "") { e.preventDefault(); onSlash(); }
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onEnter(); }
        }}
        placeholder={block.text === "" ? "Type '/' for commands" : ""}
        className={cn(
          "flex-1 resize-none bg-transparent outline-none placeholder:text-muted/40",
          styles[block.kind],
          block.kind === "check" && block.done && "text-muted line-through"
        )}
      />
    </div>
  );
}

const docActions = [
  "Improve writing", "Summarize", "Rewrite", "Translate",
  "Extract tasks", "Create outline", "Continue writing",
];

function AIDocPanel({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const run = (action: string) => {
    setBusy(action);
    setResult(null);
    setTimeout(() => {
      setBusy(null);
      setResult(
        action === "Extract tasks"
          ? "Found 3 tasks: increase activation, reduce churn, improve onboarding."
          : action === "Summarize"
          ? "This doc sets the Q4 focus on activation, retention, and expansion, with three prioritized goals."
          : `Done — ${action.toLowerCase()} applied to the document.`
      );
    }, 1100);
  };

  return (
    <aside className="hidden w-80 shrink-0 flex-col border-l border-line bg-canvas/50 xl:flex">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkle size={15} />
          <span className="text-[13.5px] font-semibold text-ink">Rover</span>
        </div>
        <button onClick={onClose} className="rounded-md p-1 text-muted hover:bg-ink/5" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-[13.5px] leading-relaxed text-ink/80">
          I found three related documents. What would you like to do?
        </p>
        <div className="mt-3 space-y-1.5">
          {docActions.map((a) => (
            <button
              key={a}
              onClick={() => run(a)}
              disabled={!!busy}
              className="flex w-full items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-left text-[13px] text-ink transition-colors hover:border-accent/30 hover:bg-accent/[0.04] disabled:opacity-60"
            >
              <SparkleIcon className="h-3.5 w-3.5 text-accent" />
              {a}
            </button>
          ))}
        </div>

        {busy && (
          <div className="mt-4 flex items-center gap-2 text-[13px] text-muted">
            <ThinkingDots /> {busy}…
          </div>
        )}
        {result && (
          <div className="mt-4 rounded-xl border border-accent/20 bg-accent/[0.04] p-3 text-[13px] leading-relaxed text-ink animate-fade-in">
            {result}
          </div>
        )}
      </div>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-muted">
          <MessageSquare className="h-3.5 w-3.5" /> 2 comments · 4 collaborators
        </div>
      </div>
    </aside>
  );
}
