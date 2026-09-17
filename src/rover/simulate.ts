// Simulation / What-if + Counterfactual engine.
//
// Pure functions that project the impact of a hypothetical change using the
// Work Graph. They read state but NEVER mutate it — no store writes happen
// here. Results are labeled as estimates, not facts.

import type { RoverState, Simulation, SimulationChange, SimulationKind, ID } from "./types";
import { buildGraph, findImpact, type GraphNode } from "./graph";
import { uid, nowISO } from "./id";

export interface SimulationInput {
  kind: SimulationKind;
  targetId?: ID;
  /** for delay_deadline */
  days?: number;
  /** for add_capacity */
  people?: number;
}

const severityFor = (kind: SimulationKind): SimulationChange["severity"] =>
  kind === "cancel_project" || kind === "remove_feature" ? "critical"
    : kind === "do_nothing" ? "warning" : "info";

export function simulate(state: RoverState, input: SimulationInput): Simulation {
  const g = buildGraph(state);
  const target = input.targetId ? g.nodes.find((n) => n.id === input.targetId) : undefined;
  const targetLabel = target?.label ?? "the workspace";

  // Downstream impact via the graph (always projection-only).
  const impact: GraphNode[] = target ? findImpact(g, target.id, 3) : [];

  const affected: SimulationChange[] = impact.map((n) => ({
    type: n.kind,
    id: n.id,
    label: n.label,
    effect: effectText(input.kind, n),
    severity: severityFor(input.kind),
  }));

  const { change, conflicts, risks, extraAffected, summary } = project(state, input, targetLabel, impact);

  return {
    id: uid("sim"),
    kind: input.kind,
    targetId: input.targetId,
    targetLabel,
    change,
    affected: [...extraAffected, ...affected],
    conflicts,
    risks,
    summary,
    at: nowISO(),
  };
}

function effectText(kind: SimulationKind, n: GraphNode): string {
  switch (kind) {
    case "delay_deadline": return `${n.kind} timeline shifts`;
    case "cancel_project": return `${n.kind} loses its parent / becomes orphaned`;
    case "remove_feature": return `${n.kind} references become stale`;
    case "add_capacity": return `${n.kind} can be accelerated`;
    case "do_nothing": return `${n.kind} continues on its current trajectory`;
  }
}

function project(
  state: RoverState,
  input: SimulationInput,
  targetLabel: string,
  impact: GraphNode[]
): { change: string; conflicts: string[]; risks: string[]; extraAffected: SimulationChange[]; summary: string } {
  const conflicts: string[] = [];
  const risks: string[] = [];
  const extraAffected: SimulationChange[] = [];

  const openTasks = state.tasks.filter((t) => !t.done);
  const activeMissions = state.missions.filter((m) => !["COMPLETED", "CANCELLED"].includes(m.status));

  switch (input.kind) {
    case "delay_deadline": {
      const d = input.days ?? 14;
      // any task due on a named weekday is projected to slip
      const dated = openTasks.filter((t) => t.due && t.due !== "—");
      dated.forEach((t) => extraAffected.push({ type: "task", id: t.id, label: t.title, effect: `Due date +${d} days`, severity: "info" }));
      state.meetings.slice(0, 2).forEach((m) => extraAffected.push({ type: "meeting", id: m.id, label: m.title, effect: "May need rescheduling", severity: "info" }));
      if (activeMissions.length) conflicts.push(`${activeMissions.length} active mission(s) assume the original date`);
      risks.push("Downstream dependencies compress if the end date holds");
      risks.push("Stakeholder expectations need re-communication");
      return {
        change: `${targetLabel} timeline +${d} days`,
        conflicts, risks, extraAffected,
        summary: `Delaying ${targetLabel} by ${d} days would shift ${dated.length} task(s) and affect ${impact.length} connected item(s). This is an estimate based on the current work graph.`,
      };
    }
    case "cancel_project": {
      const proj = state.projects.find((p) => p.id === input.targetId);
      const tasks = state.tasks.filter((t) => t.projectId === input.targetId);
      tasks.forEach((t) => extraAffected.push({ type: "task", id: t.id, label: t.title, effect: "Orphaned / cancelled", severity: "critical" }));
      conflicts.push("Tasks assigned to this project lose their owner's context");
      risks.push("Sunk work may be lost");
      risks.push("Dependent teams need reallocation");
      return {
        change: `Cancel ${targetLabel}`,
        conflicts, risks, extraAffected,
        summary: `Cancelling ${targetLabel} would orphan ${tasks.length} task(s) and impact ${impact.length} connected item(s). Estimated from the work graph — no data is changed.`,
      };
    }
    case "remove_feature": {
      risks.push("Documents referencing the feature become stale");
      risks.push("Any committed roadmap items must be revised");
      return {
        change: `Remove ${targetLabel}`,
        conflicts, risks, extraAffected,
        summary: `Removing ${targetLabel} would make ${impact.length} connected item(s) stale. Projection only.`,
      };
    }
    case "add_capacity": {
      const n = input.people ?? 2;
      const blocked = state.projects.filter((p) => p.status === "blocked");
      blocked.forEach((p) => extraAffected.push({ type: "project", id: p.id, label: p.name, effect: "Could be unblocked sooner", severity: "info" }));
      risks.push("Onboarding time reduces near-term velocity");
      return {
        change: `Add ${n} engineer(s)`,
        conflicts, risks, extraAffected,
        summary: `Adding ${n} engineer(s) could accelerate ${blocked.length} blocked project(s). Estimate based on current blockers.`,
      };
    }
    case "do_nothing":
    default: {
      const atRisk = state.projects.filter((p) => p.status === "blocked" || p.insightTone === "error");
      atRisk.forEach((p) => extraAffected.push({ type: "project", id: p.id, label: p.name, effect: "Remains at risk; likely to slip", severity: "warning" }));
      const overdue = openTasks.filter((t) => t.priority === "high");
      risks.push(`${atRisk.length} at-risk project(s) continue without intervention`);
      risks.push(`${overdue.length} high-priority task(s) remain unaddressed`);
      return {
        change: "Do nothing",
        conflicts, risks, extraAffected,
        summary: `If nothing changes, ${atRisk.length} project(s) stay at risk and ${overdue.length} high-priority task(s) remain open. Counterfactual estimate.`,
      };
    }
  }
}

/** Simulatable targets for the UI picker. */
export function simulationTargets(state: RoverState) {
  return [
    ...state.projects.map((p) => ({ id: p.id, label: p.name, kind: "project" as const })),
    ...state.missions.map((m) => ({ id: m.id, label: m.name, kind: "mission" as const })),
  ];
}
