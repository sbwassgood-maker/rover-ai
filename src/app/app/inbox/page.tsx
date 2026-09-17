"use client";
import { useState } from "react";
import { AtSign, MessageSquare, CheckCircle2, Sparkles, UserCheck } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { Sparkle } from "@/components/brand/Sparkle";
import { teamMembers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const items = [
  { id: 1, type: "mention", who: "Sarah Chen", text: "mentioned you in Launch Strategy", time: "10m", icon: AtSign },
  { id: 2, type: "ai", who: "Rover", text: "Your Weekly Executive Brief is ready", time: "1h", icon: Sparkles, ai: true },
  { id: 3, type: "assign", who: "Alex Morgan", text: "assigned you 'Review Q4 targets'", time: "2h", icon: UserCheck },
  { id: 4, type: "comment", who: "Mike Reyes", text: "commented on CRM migration", time: "3h", icon: MessageSquare },
  { id: 5, type: "ai", who: "Rover", text: "Detected a new blocker in Website redesign", time: "5h", icon: Sparkles, ai: true },
];

export default function InboxPage() {
  const [read, setRead] = useState<number[]>([]);
  const markAll = () => setRead(items.map((i) => i.id));

  return (
    <>
      <PageHeader
        title="Inbox"
        description="Mentions, assignments, comments, and updates from Rover."
        actions={
          <button onClick={markAll} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-muted hover:text-ink">
            <CheckCircle2 className="h-4 w-4" /> Mark all read
          </button>
        }
      />
      <PageBody>
        <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-line bg-surface">
          {items.map((it) => {
            const isRead = read.includes(it.id);
            const tm = teamMembers.find((x) => x.name === it.who);
            return (
              <button
                key={it.id}
                onClick={() => setRead((p) => (p.includes(it.id) ? p : [...p, it.id]))}
                className="flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left last:border-0 hover:bg-ink/[0.02]"
              >
                {!isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                {isRead && <span className="h-2 w-2 shrink-0" />}
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", it.ai ? "bg-accent/10" : "")} style={!it.ai ? { backgroundColor: tm?.color } : undefined}>
                  {it.ai ? <Sparkle size={15} /> : <span className="text-[11px] font-semibold text-white">{tm?.initials}</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("text-[13.5px]", isRead ? "text-muted" : "text-ink")}>
                    <span className="font-medium">{it.who}</span> {it.text}
                  </span>
                </span>
                <span className="shrink-0 text-[12px] text-muted">{it.time}</span>
              </button>
            );
          })}
        </div>
      </PageBody>
    </>
  );
}
