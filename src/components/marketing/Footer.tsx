import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const columns: { title: string; links: string[] }[] = [
  { title: "Product", links: ["AI Workspace", "Docs", "Search", "Agents", "Automations", "Databases"] },
  { title: "Solutions", links: ["Startups", "Marketing", "Product", "Engineering", "Operations"] },
  { title: "Resources", links: ["Documentation", "Help Center", "Blog", "Changelog"] },
  { title: "Company", links: ["About", "Careers", "Contact"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security"] },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(5,1fr)]">
          <div>
            <Logo size={24} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Everything your team knows. One intelligent workspace.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-semibold text-ink">{col.title}</h4>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      href="#"
                      className="text-[13px] text-muted transition-colors hover:text-ink"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-[13px] text-muted">
            © 2026 Rover AI. All rights reserved.
          </p>
          <p className="text-[13px] text-muted">
            Your intelligent workspace.
          </p>
        </div>
      </div>
    </footer>
  );
}
