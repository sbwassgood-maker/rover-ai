"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Sparkles, FileText, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/app", icon: Home },
  { label: "Search", href: "/app/search", icon: Search },
  { label: "AI", href: "/app/ask", icon: Sparkles, ai: true },
  { label: "Docs", href: "/app/docs", icon: FileText },
];

export function BottomNav({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line bg-canvas/90 backdrop-blur-xl px-2 py-1.5 lg:hidden">
      {items.map((it) => {
        const active = it.href === "/app" ? pathname === "/app" : pathname.startsWith(it.href);
        return (
          <Link
            key={it.label}
            href={it.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px]",
              active ? "text-ink" : "text-muted"
            )}
          >
            <it.icon className={cn("h-5 w-5", it.ai && "text-accent")} />
            {it.label}
          </Link>
        );
      })}
      <button
        onClick={onMore}
        className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] text-muted"
      >
        <Menu className="h-5 w-5" />
        More
      </button>
    </nav>
  );
}
