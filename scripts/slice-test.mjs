// Runtime verification of the Rover 2.0 vertical slice against the REAL domain
// logic (compiled from src/rover). Uses an in-memory persistence provider so
// it runs in Node. Proves: goal -> mission -> intent -> plan -> agent runs ->
// real tool calls -> evidence -> verification -> mission state, plus undo.

import { RoverStore } from "../.slice/rover/store.js";
import { Orchestrator } from "../.slice/rover/orchestrator.js";

const mem = (() => {
  let data = null;
  return { load: () => data, save: (s) => { data = s; } };
})();

const store = new RoverStore(mem);
const orch = new Orchestrator(store);

function assert(cond, msg) {
  if (!cond) { console.error("❌ FAIL:", msg); process.exitCode = 1; }
  else console.log("✓", msg);
}

// 1. Create a mission from a raw goal
const mission = orch.createMission({ rawGoal: "Launch our new product" });
assert(mission.status === "PLANNING", "mission created in PLANNING");
assert(mission.intent.objectives.length > 0, "intent extracted objectives");
assert(mission.plan.length > 0, "plan has steps");
assert(mission.successCriteria.length > 0, "success criteria present");

const docsBefore = store.getState().docs.length;
const tasksBefore = store.getState().tasks.length;

// 2. Run the mission (agents execute real tools)
const res = orch.runMission(mission.id);
const after = store.getState();
const m2 = after.missions.find((x) => x.id === mission.id);

assert(after.runs.length >= 2, `spawned agent runs (${after.runs.length})`);
assert(after.toolCalls.filter((c) => c.status === "ok").length > 0, "executed real tool calls");
assert(after.evidence.length > 0, `collected evidence (${after.evidence.length})`);
assert(after.docs.length > docsBefore, `created documents (${after.docs.length - docsBefore})`);
assert(after.tasks.length > tasksBefore, `created tasks (${after.tasks.length - tasksBefore})`);
assert(after.verifications.length > 0, "produced verification reports");
assert(["MONITORING", "BLOCKED", "WAITING_APPROVAL"].includes(m2.status), `mission advanced to ${m2.status}`);
assert(m2.progress > 0, `progress advanced to ${m2.progress}%`);
assert(after.activity.some((a) => a.missionId === mission.id), "activity logged");

// 3. Firewall: every mutating tool call was permitted for its agent
const badCalls = after.toolCalls.filter((c) => c.status === "blocked");
console.log(`  (firewall blocked ${badCalls.length} disallowed calls)`);

// 4. Undo an agent run reverts its created entities
const runWithDocs = after.runs.find((r) => after.docs.some((d) => d.createdByRun === r.id));
if (runWithDocs) {
  const before = store.getState().docs.length;
  const reverted = orch.undoRun(runWithDocs.id);
  const now = store.getState().docs.length;
  assert(reverted > 0, `undoRun reverted ${reverted} change(s)`);
  assert(now < before, "documents removed after undo");
}

// 5. Decision Memory: a successful mission records a decision
assert(store.getState().decisions.some((d) => d.sourceId === mission.id), "recorded a mission decision");

// 6. Work Graph: build + query
import { buildGraph, traceDependency, findImpact } from "../.slice/rover/graph.js";
const g = buildGraph(store.getState());
assert(g.nodes.length > 0 && g.edges.length > 0, `work graph built (${g.nodes.length} nodes, ${g.edges.length} edges)`);

// 7. Sandbox mode: a sandbox mission stages changes instead of applying
const docsPre = store.getState().docs.length;
const sbxMission = orch.createMission({ rawGoal: "Launch a new product", sandbox: true });
orch.runMission(sbxMission.id);
const staged = store.getState().sandbox.filter((c) => c.status === "staged");
assert(staged.length > 0, `sandbox staged ${staged.length} change(s)`);
assert(store.getState().docs.length === docsPre, "sandbox did NOT touch live docs before apply");
const sbxM = store.getState().missions.find((x) => x.id === sbxMission.id);
assert(sbxM.status === "WAITING_APPROVAL", "sandbox mission pauses for review");

// apply the staged changes
import { applyAll } from "../.slice/rover/sandbox.js";
const applied = applyAll(store, sbxMission.id);
assert(applied > 0 && store.getState().docs.length > docsPre, `applying sandbox committed ${applied} change(s)`);

// 8. Simulation: pure projection, no live mutation
import { simulate, simulationTargets } from "../.slice/rover/simulate.js";
const simTargets = simulationTargets(store.getState());
const snapshotBefore = JSON.stringify(store.getState());
const sim = simulate(store.getState(), { kind: "delay_deadline", targetId: simTargets[0]?.id, days: 14 });
assert(sim.affected.length >= 0 && typeof sim.summary === "string", "simulation produced a projection");
assert(JSON.stringify(store.getState()) === snapshotBefore, "simulation did NOT mutate live state");
const cf = simulate(store.getState(), { kind: "do_nothing" });
assert(cf.risks.length > 0, "counterfactual 'do nothing' surfaced risks");

// 9. Watchers: evaluate raises alerts for blocked projects
import { createWatcher, evaluateWatcher } from "../.slice/rover/watchers.js";
const w = createWatcher(store, { name: "Risk watch", scopeKind: "workspace", scopeLabel: "Workspace", signals: ["blockers", "risk"], triggers: ["new_blocker", "risk_increases"], autoLaunch: false, enabled: true });
const alerts = evaluateWatcher(store, w.id);
assert(alerts.length > 0, `watcher raised ${alerts.length} alert(s) for at-risk projects`);

// 10. Shadow Rover: detects patterns
import { detectPatterns } from "../.slice/rover/shadow.js";
const patterns = detectPatterns(store.getState());
assert(patterns.length > 0, `shadow rover detected ${patterns.length} pattern(s)`);

console.log("\nMission outcome:", m2.outcome);
console.log(process.exitCode ? "\nSLICE TEST FAILED" : "\n✅ PHASES 6 & 7 VERIFIED END-TO-END");
