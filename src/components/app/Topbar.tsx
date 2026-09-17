"use client";
import { useState } from "react";
import { Menu, Search, ChevronDown } from "lucide-react";
import { Sparkle } from "@/components/brand/Sparkle";
import { currentUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function Topbar({
  onOpenMenu,
  onOpenCommand,
}: {
  onOpenMenu: () => void;
  onOpenCommand: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-canvas/80 px-4 backdrop-blur-xl">
      <button
        onClick={onOpenMenu}
        className="rounded-md p-1.5 text-ink hover:bg-ink/5 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={onOpenCommand}
        className="flex h-9 max-w-md flex-1 items-center gap-2.5 rounded-lg border border-line bg-surface px-3 text-left text-muted transition-colors hover:border-ink/20"
      >
        <Sparkle size={14} />
        <span className="flex-1 truncate text-[13.5px]">Search or ask Rover…</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-line bg-canvas px-1.5 py-0.5 text-[11px] sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-ink/5"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success/15 text-[11px] font-semibold text-success">
              {currentUser.initials}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1.5 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-float animate-scale-in">
                <div className="border-b border-line px-3 py-3">
                  <div className="text-[13px] font-medium text-ink">{currentUser.fullName}</div>
                  <div className="text-[12px] text-muted">{currentUser.email}</div>
                </div>
                <div className="p-1">
                  {["Profile", "Workspace settings", "Members", "Billing"].map((i) => (
                    <button
                      key={i}
                      className="block w-full rounded-md px-2.5 py-2 text-left text-[13.5px] text-ink hover:bg-ink/5"
                    >
                      {i}
                    </button>
                  ))}
                </div>
                <div className="border-t border-line p-1">
                  <a
                    href="/"
                    className="block w-full rounded-md px-2.5 py-2 text-left text-[13.5px] text-muted hover:bg-ink/5"
                  >
                    Log out
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
