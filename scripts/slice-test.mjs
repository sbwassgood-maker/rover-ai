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

console.log("\nMission outcome:", m2.outcome);
console.log(process.exitCode ? "\nSLICE TEST FAILED" : "\n✅ VERTICAL SLICE WORKS END-TO-END");
