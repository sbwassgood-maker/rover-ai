// Work Graph — a unified graph over Rover entities. Built on demand from the
// current store state (entities remain the source of truth; the graph is a
// derived index). Provides the queries Rover needs to reason about impact and
// dependencies: findRelated, traceDependency, findImpact.

import type { RoverState, ID } from "./types";

export type NodeKind =
  | "workspace" | "member" | "document" | "project" | "task"
  | "meeting" | "mission" | "agent" | "run" | "decision" | "evidence";

export type EdgeKind =
  | "OWNS" | "ASSIGNED_TO" | "BELONGS_TO" | "DEPENDS_ON" | "REFERENCES"
  | "CREATED_FROM" | "DISCUSSED_IN" | "DECIDED_IN" | "BLOCKS" | "AFFECTS"
  | "IMPLEMENTS" | "VERIFIES" | "DERIVED_FROM";

export interface GraphNode {
  id: ID;
  kind: NodeKind;
  label: string;
  meta?: Record<string, unknown>;
}

export interface GraphEdge {
  from: ID;
  to: ID;
  kind: EdgeKind;
}

export interface WorkGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function buildGraph(s: RoverState): WorkGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const add = (n: GraphNode) => nodes.push(n);
  const link = (from: ID, to: ID, kind: EdgeKind) => {
    if (from && to) edges.push({ from, to, kind });
  };
  const memberByName = new Map(s.members.map((m) => [m.name, m.id] as const));

  add({ id: s.workspace.id, kind: "workspace", label: s.workspace.name });
  s.members.forEach((m) => add({ id: m.id, kind: "member", label: m.name, meta: { role: m.role } }));
  s.agents.forEach((a) => add({ id: a.id, kind: "agent", label: a.name, meta: { role: a.role } }));

  s.docs.forEach((d) => {
    add({ id: d.id, kind: "document", label: d.title, meta: { team: d.team } });
    const owner = memberByName.get(d.author);
    if (owner) link(owner, d.id, "OWNS");
    if (d.createdByRun) link(d.id, d.createdByRun, "CREATED_FROM");
  });

  s.projects.forEach((p) => {
    add({ id: p.id, kind: "project", label: p.name, meta: { status: p.status } });
    const owner = memberByName.get(p.owner);
    if (owner) link(owner, p.id, "OWNS");
  });

  s.tasks.forEach((t) => {
    add({ id: t.id, kind: "task", label: t.title, meta: { status: t.status } });
    const assignee = memberByName.get(t.assignee);
    if (assignee) link(t.id, assignee, "ASSIGNED_TO");
    if (t.projectId) link(t.id, t.projectId, "BELONGS_TO");
    if (t.missionId) link(t.id, t.missionId, "BELONGS_TO");
    if (t.createdByRun) link(t.id, t.createdByRun, "CREATED_FROM");
  });

  s.meetings.forEach((m) => {
    add({ id: m.id, kind: "meeting", label: m.title });
    m.participants.forEach((p) => {
      const mid = memberByName.get(p);
      if (mid) link(mid, m.id, "DISCUSSED_IN");
    });
  });

  s.missions.forEach((m) => {
    add({ id: m.id, kind: "mission", label: m.name, meta: { status: m.status } });
    m.runIds.forEach((rid) => link(rid, m.id, "BELONGS_TO"));
  });

  s.runs.forEach((r) => {
    add({ id: r.id, kind: "run", label: r.agentName + " run", meta: { status: r.status } });
    link(r.agentId, r.id, "IMPLEMENTS");
    if (r.verificationId) link(r.verificationId, r.id, "VERIFIES");
  });

  s.decisions.forEach((d) => {
    add({ id: d.id, kind: "decision", label: d.decision, meta: { status: d.status } });
    if (d.sourceId) link(d.id, d.sourceId, "DECIDED_IN");
    d.affects.forEach((a) => link(d.id, a.id, "AFFECTS"));
  });

  // Evidence links (source -> evidence -> derived)
  s.evidence.forEach((e) => {
    if (nodes.some((n) => n.id === e.sourceId)) {
      // reference edge from any run's tool call that used it is implied;
      // we surface source references directly for traceability.
      link(e.sourceId, e.sourceId, "REFERENCES");
    }
  });

  return { nodes, edges };
}

/** Neighbors of a node (both directions), annotated with the edge kind. */
export function findRelated(g: WorkGraph, id: ID): { node: GraphNode; via: EdgeKind; dir: "out" | "in" }[] {
  const byId = new Map(g.nodes.map((n) => [n.id, n] as const));
  const out = g.edges.filter((e) => e.from === id && e.to !== id).map((e) => ({ node: byId.get(e.to)!, via: e.kind, dir: "out" as const }));
  const inc = g.edges.filter((e) => e.to === id && e.from !== id).map((e) => ({ node: byId.get(e.from)!, via: e.kind, dir: "in" as const }));
  return [...out, ...inc].filter((r) => r.node);
}

/** BFS over DEPENDS_ON / BELONGS_TO / BLOCKS to trace what a node depends on. */
export function traceDependency(g: WorkGraph, id: ID, maxDepth = 3): GraphNode[] {
  const byId = new Map(g.nodes.map((n) => [n.id, n] as const));
  const depKinds: EdgeKind[] = ["DEPENDS_ON", "BELONGS_TO", "BLOCKS"];
  const seen = new Set<ID>([id]);
  const out: GraphNode[] = [];
  let frontier = [id];
  for (let d = 0; d < maxDepth && frontier.length; d++) {
    const next: ID[] = [];
    for (const cur of frontier) {
      g.edges.filter((e) => e.from === cur && depKinds.includes(e.kind)).forEach((e) => {
        if (!seen.has(e.to)) { seen.add(e.to); const n = byId.get(e.to); if (n) { out.push(n); next.push(e.to); } }
      });
    }
    frontier = next;
  }
  return out;
}

/** What is impacted by a node (reverse of dependency + AFFECTS/CREATED_FROM). */
export function findImpact(g: WorkGraph, id: ID, maxDepth = 3): GraphNode[] {
  const byId = new Map(g.nodes.map((n) => [n.id, n] as const));
  const impactKinds: EdgeKind[] = ["BELONGS_TO", "AFFECTS", "CREATED_FROM", "BLOCKS", "ASSIGNED_TO"];
  const seen = new Set<ID>([id]);
  const out: GraphNode[] = [];
  let frontier = [id];
  for (let d = 0; d < maxDepth && frontier.length; d++) {
    const next: ID[] = [];
    for (const cur of frontier) {
      g.edges.filter((e) => e.to === cur && impactKinds.includes(e.kind)).forEach((e) => {
        if (!seen.has(e.from)) { seen.add(e.from); const n = byId.get(e.from); if (n) { out.push(n); next.push(e.from); } }
      });
    }
    frontier = next;
  }
  return out;
}

export const NODE_KINDS: NodeKind[] = [
  "mission", "project", "task", "document", "meeting", "decision", "member", "agent", "run",
];
