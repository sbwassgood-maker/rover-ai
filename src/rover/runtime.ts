// Agent Runtime — executes an agent against a goal through a real loop:
//   plan -> select tools -> (firewall) -> execute -> collect evidence -> verify
// Everything is persisted (AgentRun, AgentToolCall, AgentArtifact, AgentMessage,
// Evidence, Approval, VerificationReport, Activity). Nothing here is faked: if a
// tool is blocked or needs approval, the run reflects that truthfully.
//
// Behind the AgentRuntime interface so a real model-backed runtime can replace
// the local implementation without changing orchestration/UI callers.

import type {
  AgentDef, AgentRun, AgentToolCall, AgentArtifact, Evidence, Approval,
  Intent, ID, ArtifactKind, RoverState,
} from "./types";
import { RoverStore } from "./store";
import { getTool, ToolContext } from "./tools";
import { evaluate } from "./firewall";
import { verifier } from "./verify";
import { uid, nowISO } from "./id";

export interface AgentRunInput {
  agent: AgentDef;
  goal: string;
  intent: Intent;
  missionId?: ID;
  /** ordered tool plan: tool name + args */
  steps: { tool: string; args: Record<string, unknown>; note?: string }[];
  artifact?: { kind: ArtifactKind; title: string; content: string };
  /** when true, mutating tools stage to the sandbox instead of applying */
  sandbox?: boolean;
}

export interface AgentRunResult {
  run: AgentRun;
  needsApproval: boolean;
  verificationPassed: boolean;
}

export interface AgentRuntime {
  createRun(input: AgentRunInput): AgentRun;
  execute(runId: ID): AgentRunResult;
}

export class LocalAgentRuntime implements AgentRuntime {
  constructor(private store: RoverStore) {}

  createRun(input: AgentRunInput): AgentRun {
    const run: AgentRun = {
      id: uid("run"),
      workspaceId: this.store.getState().workspace.id,
      missionId: input.missionId,
      agentId: input.agent.id,
      agentName: input.agent.name,
      goal: input.goal,
      status: "queued",
      plannedSteps: input.steps.map((s) => s.note ?? s.tool),
      toolCallIds: [],
      artifactIds: [],
      messageIds: [],
      startedAt: nowISO(),
    };
    this.store.setState((prev) => ({ ...prev, runs: [run, ...prev.runs] }));
    this.log(run.id, "planner", `Planned ${input.steps.length} step(s) for: ${input.goal}`);
    // stash the plan on the instance keyed by runId
    this.plans.set(run.id, input);
    return run;
  }

  private plans = new Map<ID, AgentRunInput>();

  execute(runId: ID): AgentRunResult {
    const input = this.plans.get(runId);
    const workspaceId = this.store.getState().workspace.id;
    if (!input) {
      this.patchRun(runId, { status: "failed", finishedAt: nowISO() });
      return { run: this.getRun(runId)!, needsApproval: false, verificationPassed: false };
    }

    this.patchRun(runId, { status: "executing" });
    const ctx: ToolContext = { store: this.store, workspaceId, runId, actor: input.agent.name, sandbox: input.sandbox, missionId: input.missionId };

    const collectedEvidence: Evidence[] = [];
    const toolCalls: AgentToolCall[] = [];
    let needsApproval = false;

    for (const step of input.steps) {
      const tool = getTool(step.tool);
      if (!tool) {
        this.recordCall(runId, step.tool, step.args, "LOW", "error", { error: `Unknown tool ${step.tool}` }, toolCalls);
        continue;
      }

      // Agent Firewall
      const decision = evaluate(input.agent, tool);
      if (!decision.allow && decision.requiresApproval) {
        needsApproval = true;
        const approval = this.requestApproval(runId, input.missionId, tool.name, tool.risk, decision.reason);
        const call = this.recordCall(runId, tool.name, step.args, tool.risk, "awaiting_approval", { approvalId: approval.id }, toolCalls);
        call.evidenceIds = [];
        this.log(runId, "system", `Firewall: ${decision.reason} — approval requested.`);
        continue; // do not execute until approved
      }
      if (!decision.allow) {
        this.recordCall(runId, tool.name, step.args, tool.risk, "blocked", { reason: decision.reason }, toolCalls);
        this.log(runId, "system", `Firewall blocked ${tool.name}: ${decision.reason}`);
        continue;
      }

      // Execute for real
      const result = tool.run(step.args, ctx);
      const evIds: ID[] = [];
      (result.evidence ?? []).forEach((e) => {
        const full: Evidence = { ...e, id: uid("ev"), workspaceId, at: nowISO(), claim: e.claim || step.note || input.goal };
        collectedEvidence.push(full);
        evIds.push(full.id);
        this.store.setState((prev) => ({ ...prev, evidence: [full, ...prev.evidence] }));
      });
      const call = this.recordCall(
        runId, tool.name, step.args, tool.risk,
        result.ok ? "ok" : "error",
        result.data, toolCalls, result.ok ? undefined : result.summary
      );
      call.undo = result.undo;
      call.evidenceIds = evIds;
      this.persistCall(call);
      this.log(runId, "tool", result.summary);
    }

    // Artifact (structured output the agent produces)
    let artifacts: AgentArtifact[] = [];
    if (input.artifact) {
      const art: AgentArtifact = {
        id: uid("art"), runId,
        kind: input.artifact.kind, title: input.artifact.title,
        content: input.artifact.content, createdAt: nowISO(),
      };
      artifacts = [art];
      this.store.setState((prev) => ({ ...prev, artifacts: [art, ...prev.artifacts] }));
      this.patchRun(runId, { artifactIds: [art.id] });
    }

    if (needsApproval) {
      this.patchRun(runId, { status: "waiting_approval" });
      return { run: this.getRun(runId)!, needsApproval: true, verificationPassed: false };
    }

    // Verify
    this.patchRun(runId, { status: "verifying" });
    this.log(runId, "verifier", "Reviewer agent checking success criteria against evidence…");
    const report = verifier.verify({
      runId,
      missionId: input.missionId,
      successCriteria: input.intent.successCriteria,
      evidence: collectedEvidence,
      artifacts,
      toolCalls,
    });
    this.store.setState((prev) => ({ ...prev, verifications: [report, ...prev.verifications] }));
    this.log(runId, "verifier", report.summary);

    const finishedAt = nowISO();
    this.patchRun(runId, {
      status: report.passed ? "succeeded" : "failed",
      verificationId: report.id,
      finishedAt,
      durationMs: Date.now() - new Date(this.getRun(runId)!.startedAt).getTime(),
    });

    return { run: this.getRun(runId)!, needsApproval: false, verificationPassed: report.passed };
  }

  /** Resume a run after its pending approvals were decided. */
  resumeAfterApproval(runId: ID): AgentRunResult {
    const input = this.plans.get(runId);
    if (!input) return { run: this.getRun(runId)!, needsApproval: false, verificationPassed: false };
    // Re-run: execute only the previously-approved (now approved) steps.
    // For the local slice we simply re-execute the full plan; approved tools now pass.
    const approvals = this.store.getState().approvals.filter((a) => a.runId === runId);
    const anyPending = approvals.some((a) => a.status === "pending");
    if (anyPending) return { run: this.getRun(runId)!, needsApproval: true, verificationPassed: false };
    // temporarily elevate: approved tool calls execute regardless of ceiling
    return this.executeApproved(runId, input);
  }

  private executeApproved(runId: ID, input: AgentRunInput): AgentRunResult {
    const workspaceId = this.store.getState().workspace.id;
    const ctx: ToolContext = { store: this.store, workspaceId, runId, actor: input.agent.name, sandbox: input.sandbox, missionId: input.missionId };
    const collectedEvidence: Evidence[] = [];
    const toolCalls: AgentToolCall[] = this.store.getState().toolCalls.filter((c) => c.runId === runId);

    // Execute the steps that were awaiting approval
    const awaiting = this.store.getState().toolCalls.filter((c) => c.runId === runId && c.status === "awaiting_approval");
    for (const pending of awaiting) {
      const tool = getTool(pending.tool);
      if (!tool) continue;
      const result = tool.run(pending.args, ctx);
      const evIds: ID[] = [];
      (result.evidence ?? []).forEach((e) => {
        const full: Evidence = { ...e, id: uid("ev"), workspaceId, at: nowISO(), claim: e.claim || input.goal };
        collectedEvidence.push(full);
        evIds.push(full.id);
        this.store.setState((prev) => ({ ...prev, evidence: [full, ...prev.evidence] }));
      });
      this.store.setState((prev) => ({
        ...prev,
        toolCalls: prev.toolCalls.map((c) =>
          c.id === pending.id
            ? { ...c, status: result.ok ? "ok" : "error", result: result.data, undo: result.undo, evidenceIds: evIds }
            : c
        ),
      }));
      this.log(runId, "tool", `(approved) ${result.summary}`);
    }

    const artifacts = this.store.getState().artifacts.filter((a) => a.runId === runId);
    const allCalls = this.store.getState().toolCalls.filter((c) => c.runId === runId);
    const allEvidence = this.store.getState().evidence.filter((e) =>
      allCalls.some((c) => c.evidenceIds.includes(e.id))
    );

    this.patchRun(runId, { status: "verifying" });
    const report = verifier.verify({
      runId,
      missionId: input.missionId,
      successCriteria: input.intent.successCriteria,
      evidence: allEvidence,
      artifacts,
      toolCalls: allCalls,
    });
    this.store.setState((prev) => ({ ...prev, verifications: [report, ...prev.verifications] }));
    this.log(runId, "verifier", report.summary);
    this.patchRun(runId, {
      status: report.passed ? "succeeded" : "failed",
      verificationId: report.id,
      finishedAt: nowISO(),
    });
    return { run: this.getRun(runId)!, needsApproval: false, verificationPassed: report.passed };
  }

  /* ---------------- helpers ---------------- */

  private getRun(runId: ID): AgentRun | undefined {
    return this.store.getState().runs.find((r) => r.id === runId);
  }

  private patchRun(runId: ID, patch: Partial<AgentRun>) {
    this.store.setState((prev) => ({
      ...prev,
      runs: prev.runs.map((r) => (r.id === runId ? { ...r, ...patch } : r)),
    }));
  }

  private recordCall(
    runId: ID, tool: string, args: Record<string, unknown>, risk: AgentToolCall["risk"],
    status: AgentToolCall["status"], result: unknown, sink: AgentToolCall[], error?: string
  ): AgentToolCall {
    const call: AgentToolCall = {
      id: uid("call"), runId, tool, args, risk, status, result, error, evidenceIds: [], at: nowISO(),
    };
    sink.push(call);
    this.persistCall(call);
    return call;
  }

  private persistCall(call: AgentToolCall) {
    this.store.setState((prev) => {
      const exists = prev.toolCalls.some((c) => c.id === call.id);
      const toolCalls = exists
        ? prev.toolCalls.map((c) => (c.id === call.id ? call : c))
        : [call, ...prev.toolCalls];
      const runs = prev.runs.map((r) =>
        r.id === call.runId && !r.toolCallIds.includes(call.id)
          ? { ...r, toolCallIds: [...r.toolCallIds, call.id] }
          : r
      );
      return { ...prev, toolCalls, runs };
    });
  }

  private requestApproval(runId: ID, missionId: ID | undefined, tool: string, risk: AgentToolCall["risk"], reason: string): Approval {
    const approval: Approval = {
      id: uid("appr"),
      workspaceId: this.store.getState().workspace.id,
      runId, missionId, title: `Approve ${tool}`, detail: reason, risk,
      status: "pending", requestedAt: nowISO(),
    };
    this.store.setState((prev) => ({ ...prev, approvals: [approval, ...prev.approvals] }));
    return approval;
  }

  private log(runId: ID, role: "planner" | "agent" | "tool" | "verifier" | "system", text: string) {
    const id = uid("msg");
    this.store.setState((prev) => ({
      ...prev,
      messages: [{ id, runId, role, text, at: nowISO() }, ...prev.messages],
      runs: prev.runs.map((r) => (r.id === runId ? { ...r, messageIds: [...r.messageIds, id] } : r)),
    }));
  }
}
