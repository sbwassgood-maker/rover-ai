// Sandbox — apply or reject staged changes. Staged changes never touched the
// live collections; applying one commits it (and records an undo path via the
// created entity), rejecting one simply discards it. Every change is
// attributable to the run that produced it.

import type { RoverState, CollectionName, SandboxChange } from "./types";
import { RoverStore } from "./store";
import { nowISO, uid } from "./id";

function commit(store: RoverStore, change: SandboxChange) {
  if (change.op === "create") {
    store.setState((prev) => ({
      ...prev,
      [change.collection]: [change.payload, ...(prev[change.collection] as unknown as unknown[])],
    }) as RoverState);
  }
  // update/delete ops would be handled here when introduced.
}

export function applyChange(store: RoverStore, changeId: string): SandboxChange | undefined {
  const change = store.getState().sandbox.find((c) => c.id === changeId && c.status === "staged");
  if (!change) return;
  commit(store, change);
  store.setState((prev) => ({
    ...prev,
    sandbox: prev.sandbox.map((c) => (c.id === changeId ? { ...c, status: "applied" } : c)),
    activity: [
      { id: uid("act"), workspaceId: prev.workspace.id, actor: change.agentName, action: `Applied staged change: ${change.label}`, missionId: change.missionId, runId: change.runId, at: nowISO() },
      ...prev.activity,
    ],
  }));
  return change;
}

export function rejectChange(store: RoverStore, changeId: string) {
  const change = store.getState().sandbox.find((c) => c.id === changeId && c.status === "staged");
  if (!change) return;
  store.setState((prev) => ({
    ...prev,
    sandbox: prev.sandbox.map((c) => (c.id === changeId ? { ...c, status: "rejected" } : c)),
    activity: [
      { id: uid("act"), workspaceId: prev.workspace.id, actor: change.agentName, action: `Rejected staged change: ${change.label}`, missionId: change.missionId, runId: change.runId, at: nowISO() },
      ...prev.activity,
    ],
  }));
}

export function applyAll(store: RoverStore, missionId?: string): number {
  const staged = store.getState().sandbox.filter((c) => c.status === "staged" && (!missionId || c.missionId === missionId));
  staged.forEach((c) => applyChange(store, c.id));
  return staged.length;
}

export function rejectAll(store: RoverStore, missionId?: string): number {
  const staged = store.getState().sandbox.filter((c) => c.status === "staged" && (!missionId || c.missionId === missionId));
  staged.forEach((c) => rejectChange(store, c.id));
  return staged.length;
}
