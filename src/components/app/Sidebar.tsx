"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, PanelLeftClose, Plus } from "lucide-react";
import { RoverMark } from "@/components/brand/Logo";
import { primaryNav, roverNav, workspaceNav, teamNav, type NavItem } from "./nav-config";
import { cn } from "@/lib/utils";

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active =
    item.href === "/app"
      ? pathname === "/app"
      : pathname.startsWith(item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13.5px] transition-colors",
        active
          ? "bg-ink/[0.06] font-medium text-ink"
          : "text-muted hover:bg-ink/5 hover:text-ink"
      )}
    >
      <item.icon
        className={cn("h-[17px] w-[17px]", item.ai && "text-accent")}
        strokeWidth={2}
      />
      {item.label}
    </Link>
  );
}

export function SidebarContent({
  onNavigate,
  onCollapse,
}: {
  onNavigate?: () => void;
  onCollapse?: () => void;
}) {
  return (
    <div className="flex h-full flex-col p-3">
      <div className="flex items-center justify-between px-1.5 py-1">
        <Link href="/app" onClick={onNavigate} className="flex items-center gap-2">
          <RoverMark size={20} className="text-ink" />
          <span className="text-[14px] font-semibold tracking-tight text-ink">
            rover <span className="text-accent">AI</span>
          </span>
        </Link>
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="hidden rounded-md p-1 text-muted hover:bg-ink/5 lg:block"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="mt-4 space-y-0.5">
        {primaryNav.map((n) => (
          <NavLink key={n.href} item={n} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="mt-5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted/70">
        Intelligence
      </div>
      <nav className="mt-1.5 space-y-0.5">
        {roverNav.map((n) => (
          <NavLink key={n.href} item={n} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="mt-5 flex items-center justify-between px-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted/70">
          Workspace
        </span>
        <button className="rounded p-0.5 text-muted hover:bg-ink/5" aria-label="New">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <nav className="mt-1.5 space-y-0.5">
        {workspaceNav.map((n) => (
          <NavLink key={n.href} item={n} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="mt-5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted/70">
        Team
      </div>
      <nav className="mt-1.5 space-y-0.5">
        {teamNav.map((t) => (
          <Link
            key={t}
            href="/app/projects"
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13.5px] text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <span className="h-2.5 w-2.5 rounded-[4px] bg-muted/40" />
            {t}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-line pt-2">
        <NavLink item={{ label: "Settings", href: "/app/settings", icon: Settings }} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
