// Tool System — the ONLY way agents touch the workspace. Each tool declares a
// risk level, executes against the real (persisted) store, returns a typed
// result plus optional evidence, and — for mutations — captures undo ops so
// an Agent Run can be reversed.
//
// Agents never import the store directly; they receive a ToolContext and may
// only call tools they are permitted to (enforced by the Agent Firewall).

import type {
  RoverState, ToolRisk, UndoOp, Evidence, CollectionName,
} from "./types";
import { RoverStore } from "./store";
import { uid, nowISO } from "./id";

export interface ToolContext {
  store: RoverStore;
  workspaceId: string;
  runId: string;
  /** who is calling — used for activity attribution */
  actor: string;
}

export interface ToolResult {
  ok: boolean;
  data?: unknown;
  summary: string;
  evidence?: Omit<Evidence, "id" | "workspaceId" | "at">[];
  /** reversible operations, captured for Undo */
  undo?: UndoOp[];
  createdRefs?: { collection: CollectionName; id: string }[];
}

export interface ToolDef {
  name: string;
  description: string;
  risk: ToolRisk;
  /** true if the tool mutates workspace state */
  mutates: boolean;
  run: (args: Record<string, unknown>, ctx: ToolContext) => ToolResult;
}

/* --------------------------- helpers --------------------------- */

function str(args: Record<string, unknown>, key: string, fallback = ""): string {
  const v = args[key];
  return typeof v === "string" ? v : fallback;
}

function push<T extends { id: string }>(
  ctx: ToolContext,
  collection: CollectionName,
  item: T
): UndoOp {
  ctx.store.setState((prev) => ({
    ...prev,
    [collection]: [item, ...(prev[collection] as unknown as T[])],
  }) as RoverState);
  return { kind: "delete", collection, id: item.id };
}

/* --------------------------- tools ----------------------------- */

const searchWorkspace: ToolDef = {
  name: "searchWorkspace",
  description: "Search across docs, projects, tasks and meetings.",
  risk: "LOW",
  mutates: false,
  run: (args, ctx) => {
    const q = str(args, "query").toLowerCase();
    const s = ctx.store.getState();
    const hit = (t: string) => !q || t.toLowerCase().includes(q);
    const docs = s.docs.filter((d) => hit(d.title) || hit(d.excerpt));
    const projects = s.projects.filter((p) => hit(p.name) || hit(p.insight));
    const tasks = s.tasks.filter((t) => hit(t.title));
    const meetings = s.meetings.filter((m) => hit(m.title) || hit(m.summary));
    const total = docs.length + projects.length + tasks.length + meetings.length;
    return {
      ok: true,
      summary: `Searched the workspace and found ${total} related items.`,
      data: { docs, projects, tasks, meetings },
      evidence: [
        ...docs.slice(0, 3).map((d) => ev("document", d.id, d.title, `${q || "workspace"} referenced`)),
        ...projects.slice(0, 2).map((p) => ev("project", p.id, p.name, p.insight)),
        ...meetings.slice(0, 1).map((m) => ev("meeting", m.id, m.title, m.summary)),
      ],
    };
  },
};

const readDocument: ToolDef = {
  name: "readDocument",
  description: "Read a document by id or title.",
  risk: "LOW",
  mutates: false,
  run: (args, ctx) => {
    const key = str(args, "id") || str(args, "title");
    const d = ctx.store.getState().docs.find(
      (x) => x.id === key || x.title.toLowerCase() === key.toLowerCase()
    );
    if (!d) return { ok: false, summary: `No document found for "${key}".` };
    return {
      ok: true,
      summary: `Read "${d.title}".`,
      data: d,
      evidence: [ev("document", d.id, d.title, d.excerpt)],
    };
  },
};

const searchMeetings: ToolDef = {
  name: "searchMeetings",
  description: "Search meeting notes and extract decisions.",
  risk: "LOW",
  mutates: false,
  run: (args, ctx) => {
    const q = str(args, "query").toLowerCase();
    const meetings = ctx.store.getState().meetings.filter(
      (m) => !q || m.title.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q)
    );
    const decisions = meetings.flatMap((m) => m.decisions);
    return {
      ok: true,
      summary: `Reviewed ${meetings.length} meetings and found ${decisions.length} decisions.`,
      data: { meetings, decisions },
      evidence: meetings.slice(0, 2).map((m) => ev("meeting", m.id, m.title, m.summary)),
    };
  },
};

const analyzeProjects: ToolDef = {
  name: "analyzeProjects",
  description: "Analyze projects for risk, blockers and status.",
  risk: "LOW",
  mutates: false,
  run: (_args, ctx) => {
    const projects = ctx.store.getState().projects;
    const atRisk = projects.filter((p) => p.status === "blocked" || p.insightTone === "error");
    return {
      ok: true,
      summary: `Analyzed ${projects.length} projects; ${atRisk.length} at risk.`,
      data: { atRisk: atRisk.map((p) => p.name), total: projects.length },
      evidence: atRisk.slice(0, 3).map((p) => ev("project", p.id, p.name, `At risk: ${p.insight}`, "contradicts", 0.8)),
    };
  },
};

const findRelatedEntities: ToolDef = {
  name: "findRelatedEntities",
  description: "Find entities related to a term via the work graph.",
  risk: "LOW",
  mutates: false,
  run: (args, ctx) => {
    const q = str(args, "term").toLowerCase();
    const s = ctx.store.getState();
    const related = [
      ...s.docs.filter((d) => d.title.toLowerCase().includes(q)).map((d) => ({ type: "document", label: d.title })),
      ...s.projects.filter((p) => p.name.toLowerCase().includes(q)).map((p) => ({ type: "project", label: p.name })),
      ...s.tasks.filter((t) => t.title.toLowerCase().includes(q)).map((t) => ({ type: "task", label: t.title })),
    ];
    return { ok: true, summary: `Found ${related.length} related entities.`, data: related };
  },
};

const createDocument: ToolDef = {
  name: "createDocument",
  description: "Create a new document in the workspace.",
  risk: "MEDIUM",
  mutates: true,
  run: (args, ctx) => {
    const title = str(args, "title", "Untitled");
    const body = str(args, "body");
    const id = uid("doc");
    const ts = nowISO();
    const undo = push(ctx, "docs", {
      id, workspaceId: ctx.workspaceId, title,
      excerpt: body.slice(0, 140) || "Created by Rover.",
      body, emoji: "✦", author: ctx.actor, team: "Product",
      createdByRun: ctx.runId, createdAt: ts, updatedAt: ts,
    });
    return {
      ok: true,
      summary: `Created document "${title}".`,
      data: { id, title },
      undo: [undo],
      createdRefs: [{ collection: "docs", id }],
      evidence: [ev("document", id, title, "Created by Rover", "supports", 1)],
    };
  },
};

const createProject: ToolDef = {
  name: "createProject",
  description: "Create a new project.",
  risk: "MEDIUM",
  mutates: true,
  run: (args, ctx) => {
    const name = str(args, "name", "New project");
    const id = uid("proj");
    const ts = nowISO();
    const undo = push(ctx, "projects", {
      id, workspaceId: ctx.workspaceId, name, status: "active" as const,
      owner: ctx.actor, priority: "medium" as const, due: "—",
      insight: "New", insightTone: "success" as const, createdAt: ts, updatedAt: ts,
    });
    return {
      ok: true, summary: `Created project "${name}".`, data: { id, name },
      undo: [undo], createdRefs: [{ collection: "projects", id }],
    };
  },
};

const createTask: ToolDef = {
  name: "createTask",
  description: "Create a task, optionally under a project or mission.",
  risk: "MEDIUM",
  mutates: true,
  run: (args, ctx) => {
    const title = str(args, "title", "New task");
    const id = uid("task");
    const ts = nowISO();
    const undo = push(ctx, "tasks", {
      id, workspaceId: ctx.workspaceId, title,
      projectId: str(args, "projectId") || undefined,
      missionId: str(args, "missionId") || undefined,
      status: "backlog" as const, assignee: str(args, "assignee", ctx.actor),
      priority: (str(args, "priority", "medium") as "high" | "medium" | "low"),
      due: str(args, "due", "—"), createdByRun: ctx.runId, createdAt: ts, updatedAt: ts,
    });
    return {
      ok: true, summary: `Created task "${title}".`, data: { id, title },
      undo: [undo], createdRefs: [{ collection: "tasks", id }],
    };
  },
};

const createMissionStep: ToolDef = {
  name: "createMissionStep",
  description: "Add a step to the current mission plan.",
  risk: "LOW",
  mutates: true,
  run: (args, ctx) => {
    const title = str(args, "title", "Step");
    const missionId = str(args, "missionId");
    ctx.store.setState((prev) => ({
      ...prev,
      missions: prev.missions.map((m) =>
        m.id === missionId
          ? { ...m, plan: [...m.plan, { id: uid("step"), title, status: "pending" as const }], updatedAt: nowISO() }
          : m
      ),
    }));
    return { ok: true, summary: `Added plan step "${title}".` };
  },
};

const completeMissionStep: ToolDef = {
  name: "completeMissionStep",
  description: "Mark a mission step complete.",
  risk: "LOW",
  mutates: true,
  run: (args, ctx) => {
    const missionId = str(args, "missionId");
    const stepId = str(args, "stepId");
    ctx.store.setState((prev) => ({
      ...prev,
      missions: prev.missions.map((m) =>
        m.id === missionId
          ? { ...m, plan: m.plan.map((s) => (s.id === stepId ? { ...s, status: "done" as const } : s)), updatedAt: nowISO() }
          : m
      ),
    }));
    return { ok: true, summary: "Completed a mission step." };
  },
};

/* --------------------------- registry -------------------------- */

export const toolRegistry: Record<string, ToolDef> = {
  searchWorkspace,
  readDocument,
  searchMeetings,
  analyzeProjects,
  findRelatedEntities,
  createDocument,
  createProject,
  createTask,
  createMissionStep,
  completeMissionStep,
};

export function getTool(name: string): ToolDef | undefined {
  return toolRegistry[name];
}

/* evidence factory */
function ev(
  sourceType: string,
  sourceId: string,
  sourceLabel: string,
  section: string,
  relationship = "supports",
  confidence = 0.9
): Omit<Evidence, "id" | "workspaceId" | "at"> {
  return { claim: "", sourceType, sourceId, sourceLabel, section, relationship, confidence };
}
