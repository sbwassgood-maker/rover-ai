"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { docs } from "@/lib/mock-data";

export default function DocsPage() {
  const [q, setQ] = useState("");
  const filtered = docs.filter(
    (d) => d.title.toLowerCase().includes(q.toLowerCase()) || d.excerpt.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Docs"
        description="Write, organize, and collaborate—with an AI partner one shortcut away."
        actions={
          <ButtonLink href="/app/docs/new" variant="primary">
            <Plus className="h-4 w-4" /> New doc
          </ButtonLink>
        }
      />
      <PageBody>
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-line bg-surface px-3">
            <Search className="h-4 w-4 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter docs…"
              className="h-10 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-muted/70"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((d) => (
              <Link
                key={d.id}
                href={`/app/docs/${d.id}`}
                className="group rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-canvas text-muted">
                    {d.emoji}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[14.5px] font-semibold text-ink">{d.title}</div>
                    <div className="text-[12px] text-muted">{d.team} · {d.updated}</div>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted">{d.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </PageBody>
    </>
  );
}
