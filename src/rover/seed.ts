// Seeds initial Rover state from the existing mock-data so the app has a
// realistic starting workspace. This runs once (first load); afterward the
// persisted state is the source of truth.

import * as mock from "@/lib/mock-data";
import { agentDefs } from "./agents";
import type {
  RoverState, Doc, Project, Task, Meeting, Member,
} from "./types";

const now = () => new Date().toISOString();
const WS = "ws_default";

export function seedState(): RoverState {
  const ts = now();

  const members: Member[] = mock.teamMembers.map((m) => ({
    id: m.id,
    workspaceId: WS,
    name: m.name,
    initials: m.initials,
    role: m.role,
    color: m.color,
  }));

  const docs: Doc[] = mock.docs.map((d) => ({
    id: d.id,
    workspaceId: WS,
    title: d.title,
    excerpt: d.excerpt,
    emoji: d.emoji,
    author: d.author,
    team: d.team,
    createdAt: ts,
    updatedAt: ts,
  }));

  const projects: Project[] = mock.projects.map((p) => ({
    id: p.id,
    workspaceId: WS,
    name: p.name,
    status: p.status,
    owner: p.owner,
    priority: p.priority,
    due: p.due,
    insight: p.insight,
    insightTone: p.insightTone,
    createdAt: ts,
    updatedAt: ts,
  }));

  const tasks: Task[] = mock.boardColumns.flatMap((col) =>
    col.tasks.map((t) => ({
      id: t.id,
      workspaceId: WS,
      title: t.title,
      status: t.status,
      assignee: t.assignee,
      priority: t.priority,
      due: t.due,
      done: t.done,
      createdAt: ts,
      updatedAt: ts,
    }))
  );

  const meetings: Meeting[] = mock.meetings.map((m) => ({
    id: m.id,
    workspaceId: WS,
    title: m.title,
    date: m.date,
    time: m.time,
    participants: m.participants,
    summary: m.summary,
    decisions: m.decisions,
    actions: m.actions,
    createdAt: ts,
    updatedAt: ts,
  }));

  // Seed Decision Memory from meeting decisions so the graph & Decisions page
  // have real content from day one.
  const decisions = meetings.flatMap((m) =>
    m.decisions.slice(0, 2).map((d, i) => ({
      id: `dec_seed_${m.id}_${i}`,
      workspaceId: WS,
      decision: d,
      rationale: `Agreed during ${m.title} on ${m.date}.`,
      people: m.participants,
      alternatives: [],
      affects: [] as { type: string; id: string; label: string }[],
      evidenceIds: [] as string[],
      status: "active" as const,
      source: `Meeting: ${m.title}`,
      sourceId: m.id,
      date: m.date,
      createdAt: ts,
      updatedAt: ts,
    }))
  );

  return {
    workspace: { id: WS, name: "Northstar", createdAt: ts },
    members,
    docs,
    projects,
    tasks,
    meetings,
    missions: [],
    agents: agentDefs.map((a) => ({ ...a })),
    runs: [],
    toolCalls: [],
    artifacts: [],
    messages: [],
    evidence: [],
    approvals: [],
    verifications: [],
    activity: [
      {
        id: "act_seed",
        workspaceId: WS,
        actor: "Rover",
        action: "Workspace initialized",
        at: ts,
      },
    ],
    decisions,
    sandbox: [],
    watchers: [
      {
        id: "watch_seed_atlas",
        workspaceId: WS,
        name: "Website redesign",
        scopeKind: "project",
        scopeId: projects.find((p) => p.name === "Website redesign")?.id,
        scopeLabel: "Website redesign",
        signals: ["deadlines", "blockers", "velocity"],
        triggers: ["risk_increases", "new_blocker"],
        autoLaunch: false,
        enabled: true,
        alerts: [],
        createdAt: ts,
        updatedAt: ts,
      },
    ],
  };
}
