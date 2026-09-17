// Watchers — persistent monitors over a scope (mission/project/database/
// workspace). Evaluating a watcher inspects real state for its triggers and
// records an Alert when a condition is met; if autoLaunch is on, it starts a
// mission to address the issue.

import type { RoverState, Watcher, WatcherAlert, ID } from "./types";
import { RoverStore } from "./store";
import { uid, nowISO } from "./id";
import { getOrchestrator } from "./orchestrator";

export function evaluateWatcher(store: RoverStore, watcherId: ID): WatcherAlert[] {
  const s = store.getState();
  const w = s.watchers.find((x) => x.id === watcherId);
  if (!w || !w.enabled) return [];

  const newAlerts: WatcherAlert[] = [];
  const push = (message: string, severity: WatcherAlert["severity"]) => {
    // de-dupe against existing unacknowledged alerts with the same message
    if (w.alerts.some((a) => a.message === message && !a.acknowledged)) return;
    newAlerts.push({ id: uid("alert"), message, severity, at: nowISO(), acknowledged: false });
  };

  // Scope the entities being watched.
  const proj = w.scopeKind === "project" ? s.projects.find((p) => p.id === w.scopeId) : undefined;
  const scopedProjects = proj ? [proj] : s.projects;

  if (w.triggers.includes("new_blocker") || w.signals.includes("blockers")) {
    scopedProjects.filter((p) => p.status === "blocked").forEach((p) =>
      push(`Blocker detected on ${p.name}: ${p.insight}`, "critical")
    );
  }
  if (w.triggers.includes("risk_increases") || w.signals.includes("risk")) {
    scopedProjects.filter((p) => p.insightTone === "error").forEach((p) =>
      push(`Risk increased on ${p.name}`, "warning")
    );
  }
  if (w.signals.includes("deadlines")) {
    const soon = s.tasks.filter((t) => !t.done && t.priority === "high" && t.due && t.due !== "—");
    if (soon.length) push(`${soon.length} high-priority task(s) approaching their due date`, "info");
  }

  if (newAlerts.length) {
    let launchedMissionId: ID | undefined;
    if (w.autoLaunch) {
      const mission = getOrchestrator().createMission({ rawGoal: `Investigate and unblock ${w.scopeLabel}` });
      getOrchestrator().runMission(mission.id);
      launchedMissionId = mission.id;
      newAlerts[0].launchedMissionId = launchedMissionId;
    }
    store.setState((prev) => ({
      ...prev,
      watchers: prev.watchers.map((x) =>
        x.id === watcherId ? { ...x, alerts: [...newAlerts, ...x.alerts], lastChecked: nowISO(), updatedAt: nowISO() } : x
      ),
      activity: [
        { id: uid("act"), workspaceId: prev.workspace.id, actor: "Rover", action: `Watcher "${w.name}" fired ${newAlerts.length} alert(s)${launchedMissionId ? " and launched a mission" : ""}`, missionId: launchedMissionId, at: nowISO() },
        ...prev.activity,
      ],
    }));
  } else {
    store.setState((prev) => ({
      ...prev,
      watchers: prev.watchers.map((x) => (x.id === watcherId ? { ...x, lastChecked: nowISO() } : x)),
    }));
  }
  return newAlerts;
}

export function createWatcher(store: RoverStore, w: Omit<Watcher, "id" | "workspaceId" | "createdAt" | "updatedAt" | "alerts">): Watcher {
  const watcher: Watcher = {
    ...w,
    id: uid("watch"),
    workspaceId: store.getState().workspace.id,
    alerts: [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  store.setState((prev) => ({ ...prev, watchers: [watcher, ...prev.watchers] }));
  return watcher;
}

export function toggleWatcher(store: RoverStore, id: ID) {
  store.setState((prev) => ({
    ...prev,
    watchers: prev.watchers.map((w) => (w.id === id ? { ...w, enabled: !w.enabled, updatedAt: nowISO() } : w)),
  }));
}

export function acknowledgeAlert(store: RoverStore, watcherId: ID, alertId: ID) {
  store.setState((prev) => ({
    ...prev,
    watchers: prev.watchers.map((w) =>
      w.id === watcherId ? { ...w, alerts: w.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)) } : w
    ),
  }));
}

export function deleteWatcher(store: RoverStore, id: ID) {
  store.setState((prev) => ({ ...prev, watchers: prev.watchers.filter((w) => w.id !== id) }));
}
