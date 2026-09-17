import { MessageCircle, AtSign, UserCheck, Lock, FileText, Users } from "lucide-react";
import { Container, SectionHeading, Reveal } from "@/components/ui/Section";
import { teamMembers } from "@/lib/mock-data";

const features = [
  { icon: MessageCircle, label: "Comments" },
  { icon: AtSign, label: "Mentions" },
  { icon: UserCheck, label: "Assignments" },
  { icon: Lock, label: "Permissions" },
  { icon: FileText, label: "Shared documents" },
  { icon: Users, label: "Team spaces" },
];

export function Collaboration() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <SectionHeading
                align="left"
                eyebrow="Team collaboration"
                title="AI for the whole team."
                description="Everyone works from the same source of truth, while Rover helps each person move faster."
              />
              <div className="mt-8 grid grid-cols-2 gap-3">
                {features.map((f) => (
                  <div key={f.label} className="flex items-center gap-2.5 text-[14px] text-ink">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface">
                      <f.icon className="h-4 w-4 text-accent" />
                    </span>
                    {f.label}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted" />
                  <span className="text-[14px] font-semibold text-ink">Launch Strategy</span>
                </div>
                <div className="flex -space-x-2">
                  {teamMembers.slice(0, 4).map((m) => (
                    <span
                      key={m.id}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface text-[10.5px] font-semibold text-white"
                      style={{ backgroundColor: m.color }}
                      title={m.name}
                    >
                      {m.initials}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  { m: teamMembers[0], text: "Can we move the beta to March 20?", note: "commented" },
                  { m: teamMembers[1], text: "Agreed. @Mike can you confirm API readiness?", note: "mentioned Mike" },
                  { m: teamMembers[2], text: "Confirmed — endpoints ship this week.", note: "replied" },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10.5px] font-semibold text-white"
                      style={{ backgroundColor: c.m.color }}
                    >
                      {c.m.initials}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13px]">
                        <span className="font-medium text-ink">{c.m.name}</span>{" "}
                        <span className="text-muted">{c.note}</span>
                      </div>
                      <div className="mt-0.5 rounded-lg rounded-tl-sm bg-canvas px-3 py-2 text-[13.5px] text-ink/85">
                        {c.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
