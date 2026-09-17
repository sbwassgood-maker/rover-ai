"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useDemo } from "./DemoProvider";
import { cn } from "@/lib/utils";

const links = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#use-cases" },
  { label: "Resources", href: "#resources" },
  { label: "Pricing", href: "#pricing" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { openDemo } = useDemo();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-canvas/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Rover AI home" className="shrink-0">
          <Logo size={24} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-ink/5 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" onClick={openDemo}>
            Watch demo
          </Button>
          <ButtonLink href="/login" variant="ghost" size="sm">
            Log in
          </ButtonLink>
          <ButtonLink href="/onboarding" variant="primary" size="sm">
            Start for free
          </ButtonLink>
        </div>

        <button
          className="rounded-md p-2 text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-line bg-canvas/95 backdrop-blur-xl transition-all duration-300 md:hidden",
          open ? "max-h-96 border-b" : "max-h-0"
        )}
      >
        <div className="space-y-1 px-5 py-4">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-ink hover:bg-ink/5"
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => { setOpen(false); openDemo(); }}
            className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-ink/5"
          >
            Watch demo
          </button>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <ButtonLink href="/login" variant="secondary" size="md">
              Log in
            </ButtonLink>
            <ButtonLink href="/onboarding" variant="primary" size="md">
              Start free
            </ButtonLink>
          </div>
        </div>
      </div>
    </header>
  );
}
