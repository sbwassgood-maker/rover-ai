// Mission Orchestrator — the top-level control loop that realizes the Rover
// principle: "Users provide outcomes. Rover handles the work."
//
//   GOAL -> INTENT -> PLAN -> AGENTS -> TOOLS(+FIREWALL) -> EVIDENCE
//        -> VERIFY -> MISSION STATE/PROGRESS -> OUTCOME
//
// Everything is persisted and observable; high-risk work surfaces approvals;
// runs are reversible via undoRun().

import type { Mission, ID, RiskLevel, Priority, AgentRun } from "./types";
import { RoverStore, getStore } from "./store";
import { intentEngine } from "./intent";
import { planMission } from "./planner";
import { getAgentDef } from "./agents";
import { LocalAgentRuntime } from "./runtime";
import { uid, nowISO } from "./id";

export interface CreateMissionInput {
  rawGoal: string;
  priority?: Priority;
  deadline?: string;
  /** stage mutating work to the sandbox for review before applying */
  sandbox?: boolean;
}

export class Orchestrator {
  private runtime: LocalAgentRuntime;
  constructor(private store: RoverStore) {
    this.runtime = new LocalAgentRuntime(store);
  }

  /** Create a mission from a raw goal: extract intent, build a plan. */
  createMission(input: CreateMissionInput): Mission {
    const workspaceId = this.store.getState().workspace.id;
    const intent = intentEngine.extract(input.rawGoal);
    const plan = planMission(intent, "pending");
    const missionId = uid("mission");
    // relink task-creating steps to the real mission id
    plan.runs.forEach((r) => r.steps.forEach((s) => { if (s.args.missionId === "pending") s.args.missionId = missionId; }));

    const overallRisk: RiskLevel = plan.risks.some((r) => r.level === "high")
      ? "high"
      : plan.risks.some((r) => r.level === "medium") ? "medium" : "low";

    const mission: Mission = {
      id: missionId,
      workspaceId,
      name: intent.goal,
      goal: intent.goal,
      originalIntent: input.rawGoal,
      intent,
      status: "PLANNING",
      progress: 0,
      priority: input.priority ?? "high",
      owner: "Alex Morgan",
      deadline: input.deadline,
      riskLevel: overallRisk,
      plan: plan.steps,
      successCriteria: intent.successCriteria,
      currentPhase: "Planning",
      risks: plan.risks.map((r) => ({ id: uid("risk"), label: r.label, level: r.level })),
      runIds: [],
      sandboxMode: input.sandbox ?? false,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    this.store.setState((prev) => ({ ...prev, missions: [mission, ...prev.missions] }));
    this.activity(`Created mission "${mission.name}"`, missionId);

    // stash the executable plan for run()
    this.plans.set(missionId, plan);
    return mission;
  }

  private plans = new Map<ID, ReturnType<typeof planMission>>();

  /**
   * Execute the mission: spawn agent runs in sequence, each executing real
   * tools through the firewall, collecting evidence and verifying. Updates
   * mission status/progress as it goes. Returns whether approval is pending.
   */
  runMission(missionId: ID): { needsApproval: boolean; mission: Mission } {
    let plan = this.plans.get(missionId);
    if (!plan) {
      // rebuild plan from stored mission (e.g. after reload)
      const m = this.getMission(missionId);
      if (!m) throw new Error("Mission not found");
      plan = planMission(m.intent, missionId);
      plan.runs.forEach((r) => r.steps.forEach((s) => { if (s.args.missionId === "pending") s.args.missionId = missionId; }));
      this.plans.set(missionId, plan);
    }

    this.patch(missionId, { status: "EXECUTING", currentPhase: "Executing" });

    const runIds: ID[] = [];
    let anyApproval = false;
    const totalUnits = plan.runs.length + 1; // +1 for verification/monitoring
    let completed = 0;

    for (let i = 0; i < plan.runs.length; i++) {
      const planned = plan.runs[i];
      const agent = getAgentDef(planned.agentId)!;
      const run = this.runtime.createRun({
        agent, goal: planned.goal, intent: this.getMission(missionId)!.intent,
        missionId, steps: planned.steps, artifact: planned.artifact,
        sandbox: this.getMission(missionId)!.sandboxMode,
      });
      runIds.push(run.id);
      const res = this.runtime.execute(run.id);
      if (res.needsApproval) anyApproval = true;

      // advance plan step
      this.advanceStep(missionId, i);
      completed += 1;
      this.patch(missionId, { progress: Math.round((completed / totalUnits) * 100) });
      this.activity(`${agent.name} ${res.needsApproval ? "requested approval" : "completed a run"}`, missionId, run.id);
    }

    this.patch(missionId, { runIds: [...(this.getMission(missionId)?.runIds ?? []), ...runIds] });

    if (anyApproval) {
      this.patch(missionId, { status: "WAITING_APPROVAL", currentPhase: "Waiting for approval" });
      return { needsApproval: true, mission: this.getMission(missionId)! };
    }

    // Sandbox mode: mutating work was staged, not applied. Pause for review
    // rather than finalizing — verification runs once changes are applied.
    const stagedCount = this.store.getState().sandbox.filter((c) => c.missionId === missionId && c.status === "staged").length;
    if (stagedCount > 0) {
      this.patch(missionId, {
        status: "WAITING_APPROVAL",
        currentPhase: `Sandbox review — ${stagedCount} change${stagedCount !== 1 ? "s" : ""} staged`,
      });
      this.activity(`Staged ${stagedCount} change(s) in the sandbox for your review`, missionId);
      return { needsApproval: true, mission: this.getMission(missionId)! };
    }

    return this.finalize(missionId, totalUnits, completed);
  }

  /** Called after the user approves/rejects pending approvals for a mission. */
  resumeMission(missionId: ID): { needsApproval: boolean; mission: Mission } {
    const runsWaiting = this.store.getState().runs.filter(
      (r) => r.missionId === missionId && r.status === "waiting_approval"
    );
    for (const r of runsWaiting) {
      const res = this.runtime.resumeAfterApproval(r.id);
      if (res.needsApproval) {
        return { needsApproval: true, mission: this.getMission(missionId)! };
      }
      this.activity(`Resumed ${r.agentName} after approval`, missionId, r.id);
    }
    const plan = this.plans.get(missionId);
    const totalUnits = (plan?.runs.length ?? 1) + 1;
    return this.finalize(missionId, totalUnits, plan?.runs.length ?? 1);
  }

  private finalize(missionId: ID, totalUnits: number, completed: number): { needsApproval: boolean; mission: Mission } {
    // Verification phase: aggregate run verifications.
    this.patch(missionId, { status: "VERIFYING", currentPhase: "Verifying" });
    const runs = this.store.getState().runs.filter((r) => r.missionId === missionId);
    const reports = this.store.getState().verifications.filter((v) => runs.some((r) => r.id === v.runId));
    const passed = reports.length > 0 && reports.every((r) => r.passed);

    // mark verification + monitoring steps
    this.advanceStep(missionId, -1, "Verification");
    const finalProgress = passed ? 100 : Math.round(((completed + 0.5) / totalUnits) * 100);

    const created = this.countCreated(missionId);
    const outcome = passed
      ? `Mission complete. Rover produced ${created.docs} document(s) and ${created.tasks} task(s), backed by ${created.evidence} pieces of evidence, and verification passed.`
      : `Executed with partial verification. Review the failed criteria and re-run to continue.`;

    this.patch(missionId, {
      status: passed ? "MONITORING" : "BLOCKED",
      currentPhase: passed ? "Monitoring" : "Needs revision",
      progress: finalProgress,
      outcome,
    });
    if (passed) this.advanceStep(missionId, -1, "Monitoring");
    this.activity(passed ? "Mission verified and now monitoring" : "Mission needs revision", missionId);

    // Record a Decision in memory when the mission's approach is confirmed.
    if (passed) this.recordMissionDecision(missionId);

    return { needsApproval: false, mission: this.getMission(missionId)! };
  }

  /** Capture the mission's approach as a persistent Decision with evidence. */
  private recordMissionDecision(missionId: ID) {
    const m = this.getMission(missionId);
    if (!m) return;
    const runs = this.store.getState().runs.filter((r) => r.missionId === missionId);
    const runIds = new Set(runs.map((r) => r.id));
    const evidenceIds = this.store.getState().evidence
      .filter((e) => this.store.getState().toolCalls.some((c) => runIds.has(c.runId) && c.evidenceIds.includes(e.id)))
      .slice(0, 5)
      .map((e) => e.id);
    const affects = this.store.getState().tasks
      .filter((t) => t.missionId === missionId)
      .slice(0, 5)
      .map((t) => ({ type: "task", id: t.id, label: t.title }));

    const decision = {
      id: uid("dec"),
      workspaceId: m.workspaceId,
      decision: `Proceed with: ${m.goal}`,
      rationale: m.intent.objectives.slice(0, 3).join("; ") || "Verified against success criteria.",
      people: [m.owner],
      alternatives: ["Do nothing", "Defer to next cycle"],
      affects,
      evidenceIds,
      status: "active" as const,
      source: `Mission: ${m.name}`,
      sourceId: m.id,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" }),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    this.store.setState((prev) => ({ ...prev, decisions: [decision, ...prev.decisions] }));
    this.activity(`Recorded decision: ${decision.decision}`, missionId);
  }

  /** Reverse every reversible tool call made by a run. */
  undoRun(runId: ID): number {
    const calls = this.store.getState().toolCalls.filter((c) => c.runId === runId && c.undo && c.status === "ok");
    let reverted = 0;
    for (const call of calls) {
      for (const op of call.undo!) {
        if (op.kind === "delete") {
          this.store.setState((prev) => ({
            ...prev,
            [op.collection]: (prev[op.collection] as unknown as { id: string }[]).filter((x) => x.id !== op.id),
          }) as never);
          reverted += 1;
        }
      }
      this.store.setState((prev) => ({
        ...prev,
        toolCalls: prev.toolCalls.map((c) => (c.id === call.id ? { ...c, status: "reverted" as const } : c)),
      }));
    }
    const run = this.store.getState().runs.find((r) => r.id === runId);
    if (run?.missionId) this.activity(`Undid ${run.agentName}'s run (${reverted} change(s) reverted)`, run.missionId, runId);
    return reverted;
  }

  cancelMission(missionId: ID) {
    this.patch(missionId, { status: "CANCELLED", currentPhase: "Cancelled" });
    this.activity("Mission cancelled", missionId);
  }

  /* ---------------- helpers ---------------- */

  private countCreated(missionId: ID) {
    const runs = this.store.getState().runs.filter((r) => r.missionId === missionId);
    const runIds = new Set(runs.map((r) => r.id));
    const calls = this.store.getState().toolCalls.filter((c) => runIds.has(c.runId) && c.status === "ok");
    return {
      docs: calls.filter((c) => c.tool === "createDocument").length,
      tasks: calls.filter((c) => c.tool === "createTask").length,
      evidence: this.store.getState().evidence.filter((e) => calls.some((c) => c.evidenceIds.includes(e.id))).length,
    };
  }

  private advanceStep(missionId: ID, index: number, byTitle?: string) {
    this.store.setState((prev) => ({
      ...prev,
      missions: prev.missions.map((m) => {
        if (m.id !== missionId) return m;
        const plan = m.plan.map((s, i) => {
          if (byTitle) return s.title === byTitle ? { ...s, status: "done" as const } : s;
          if (i === index) return { ...s, status: "done" as const };
          if (i === index + 1) return { ...s, status: "active" as const };
          return s;
        });
        return { ...m, plan, updatedAt: nowISO() };
      }),
    }));
  }

  private getMission(id: ID): Mission | undefined {
    return this.store.getState().missions.find((m) => m.id === id);
  }

  private patch(id: ID, patch: Partial<Mission>) {
    this.store.setState((prev) => ({
      ...prev,
      missions: prev.missions.map((m) => (m.id === id ? { ...m, ...patch, updatedAt: nowISO() } : m)),
    }));
  }

  private activity(action: string, missionId?: ID, runId?: ID) {
    this.store.setState((prev) => ({
      ...prev,
      activity: [
        { id: uid("act"), workspaceId: prev.workspace.id, actor: "Rover", action, missionId, runId, at: nowISO() },
        ...prev.activity,
      ],
    }));
  }
}

let orchestratorSingleton: Orchestrator | null = null;
export function getOrchestrator(): Orchestrator {
  if (!orchestratorSingleton) orchestratorSingleton = new Orchestrator(getStore());
  return orchestratorSingleton;
}
