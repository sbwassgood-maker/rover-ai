"use client";
import { useEffect, useState } from "react";
import { X, PanelLeftOpen } from "lucide-react";
import { SidebarContent } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { CommandPalette } from "./CommandPalette";
import { ToastProvider } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-canvas">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden shrink-0 border-r border-line bg-canvas/60 transition-all duration-300 lg:block",
            collapsed ? "w-0 overflow-hidden" : "w-60"
          )}
        >
          <SidebarContent onCollapse={() => setCollapsed(true)} />
        </aside>

        {/* Mobile drawer */}
        <div
          className={cn(
            "fixed inset-0 z-50 lg:hidden",
            drawerOpen ? "pointer-events-auto" : "pointer-events-none"
          )}
        >
          <div
            className={cn(
              "absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity",
              drawerOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className={cn(
              "absolute left-0 top-0 h-full w-72 border-r border-line bg-canvas transition-transform duration-300",
              drawerOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1.5 text-muted hover:bg-ink/5"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMenu={() => setDrawerOpen(true)} onOpenCommand={() => setCmdOpen(true)} />
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="absolute left-2 top-16 z-20 hidden rounded-md border border-line bg-surface p-1.5 text-muted shadow-sm hover:text-ink lg:block"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>
        </div>

        <BottomNav onMore={() => setDrawerOpen(true)} />
        <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      </div>
    </ToastProvider>
  );
}
