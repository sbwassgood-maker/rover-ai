"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({
  items,
  className,
}: {
  items: { q: string; a: React.ReactNode }[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className={cn("divide-y divide-line rounded-2xl border border-line bg-surface", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="text-[15px] font-medium text-ink">{item.q}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted transition-transform duration-300",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 text-[15px] leading-relaxed text-muted">
                  {item.a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
