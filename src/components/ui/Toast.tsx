"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: number; title: string; description?: string; tone?: "success" | "ai" };

const ToastCtx = createContext<{ push: (t: Omit<Toast, "id">) => void }>({
  push: () => {},
});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3800);
  }, []);

  const dismiss = (id: number) =>
    setToasts((prev) => prev.filter((x) => x.id !== id));

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-float animate-scale-in"
          >
            <CheckCircle2
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0",
                t.tone === "ai" ? "text-accent" : "text-success"
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-ink">{t.title}</div>
              {t.description && (
                <div className="mt-0.5 text-[13px] text-muted">{t.description}</div>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded-md p-1 text-muted hover:bg-ink/5"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
