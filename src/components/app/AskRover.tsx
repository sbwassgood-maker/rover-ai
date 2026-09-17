"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Copy, RefreshCw, FilePlus2, Check } from "lucide-react";
import { Sparkle } from "@/components/brand/Sparkle";
import { ThinkingDots } from "@/components/ui/Typewriter";
import { AIResponseView } from "./AIResponse";
import { getAIResponse, type AIResponse } from "@/lib/ai-mock";
import { suggestedPrompts, currentUser } from "@/lib/mock-data";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type Msg =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; res?: AIResponse; loading?: boolean };

export function AskRover({ initialPrompt }: { initialPrompt?: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const started = messages.length > 0;

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const uid = Date.now();
    const aid = uid + 1;
    setMessages((prev) => [
      ...prev,
      { id: uid, role: "user", text: q },
      { id: aid, role: "assistant", loading: true },
    ]);
    setInput("");
    setTimeout(() => {
      const res = getAIResponse(q);
      setMessages((prev) =>
        prev.map((m) => (m.id === aid ? { id: aid, role: "assistant", res } : m))
      );
    }, 1100);
  };

  // Fire initial prompt from ?q=
  const fired = useRef(false);
  useEffect(() => {
    if (initialPrompt && !fired.current) {
      fired.current = true;
      send(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const copy = (id: number, res?: AIResponse) => {
    const text = res?.blocks
      .map((b) => ("text" in b ? b.text : "items" in b ? b.items.join("\n") : ""))
      .join("\n") ?? "";
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-5 py-8">
          {!started ? (
            <div className="flex flex-col items-center pt-[8vh] text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface">
                <Sparkle size={22} />
              </div>
              <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">
                Good morning, {currentUser.name}
              </h1>
              <p className="mt-2 text-[15px] text-muted">
                Ask Rover anything across your workspace.
              </p>
              <div className="mt-7 grid w-full gap-2 sm:grid-cols-2">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-left text-[13.5px] text-ink transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card"
                  >
                    <Sparkle size={14} />
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex items-start justify-end gap-3">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-ink px-4 py-2.5 text-[14.5px] text-white">
                      {m.text}
                    </div>
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/15 text-[11px] font-semibold text-success">
                      {currentUser.initials}
                    </span>
                  </div>
                ) : (
                  <div key={m.id} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <Sparkle size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      {m.loading ? (
                        <div className="flex items-center gap-2 pt-1.5 text-sm text-muted">
                          <ThinkingDots /> Searching your workspace…
                        </div>
                      ) : (
                        <div className="animate-fade-in">
                          <AIResponseView res={m.res!} />
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <ActionButton onClick={() => copy(m.id, m.res)}>
                              {copied === m.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              {copied === m.id ? "Copied" : "Copy"}
                            </ActionButton>
                            <ActionButton onClick={() => toast.push({ title: "Regenerating response…", tone: "ai" })}>
                              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                            </ActionButton>
                            <ActionButton onClick={() => toast.push({ title: "Inserted into document", description: "Added to a new untitled doc.", tone: "ai" })}>
                              <FilePlus2 className="h-3.5 w-3.5" /> Insert into document
                            </ActionButton>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-line bg-canvas/80 backdrop-blur-xl px-5 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mx-auto flex w-full max-w-2xl items-end gap-2 rounded-2xl border border-line bg-surface p-2 shadow-sm focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/10"
        >
          <Sparkle size={16} className="mb-2 ml-1.5" />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask Rover anything…"
            className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-[14.5px] text-ink outline-none placeholder:text-muted/70"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
              input.trim() ? "bg-accent text-white hover:bg-accent-hover" : "bg-ink/[0.06] text-muted"
            )}
            aria-label="Send"
          >
            <ArrowUp className="h-4.5 w-4.5" />
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] text-muted/70">
          Responses are illustrative sample output. No live AI model is connected in this demo.
        </p>
      </div>
    </div>
  );
}

function ActionButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12.5px] font-medium text-muted transition-colors hover:border-ink/20 hover:text-ink"
    >
      {children}
    </button>
  );
}
