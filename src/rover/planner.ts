// Mission Planner — turns an Intent into a concrete plan: mission steps plus,
// for each executable step, an agent + an ordered set of real tool calls.
// Deterministic and local; produces genuine work (searches, documents, tasks).

import type { Intent, MissionStep, ArtifactKind } from "./types";
import { getAgentDef } from "./agents";
import { uid } from "./id";

export interface PlannedRun {
  agentId: string;
  goal: string;
  steps: { tool: string; args: Record<string, unknown>; note?: string }[];
  artifact?: { kind: ArtifactKind; title: string; content: string };
}

export interface MissionPlan {
  steps: MissionStep[];
  runs: PlannedRun[];
  risks: { label: string; level: "low" | "medium" | "high" }[];
}

/**
 * Build a plan. The first executable run is a Research pass (always safe),
 * followed by objective-specific work. Every run uses only tools the agent is
 * permitted to call.
 */
export function planMission(intent: Intent, missionId: string): MissionPlan {
  const term = keyword(intent.goal);

  const research = getAgentDef("research")!;
  const runs: PlannedRun[] = [
    {
      agentId: research.id,
      goal: `Research the workspace for: ${intent.goal}`,
      steps: [
        { tool: "searchWorkspace", args: { query: term }, note: "Search workspace" },
        { tool: "searchMeetings", args: { query: term }, note: "Review meetings & decisions" },
        { tool: "findRelatedEntities", args: { term }, note: "Map related work" },
      ],
      artifact: {
        kind: "ResearchReport",
        title: `Research: ${intent.goal}`,
        content: `Objectives:\n- ${intent.objectives.join("\n- ")}\n\nConstraints:\n- ${intent.constraints.join("\n- ")}`,
      },
    },
  ];

  // Objective-driven work
  const objectivesText = intent.objectives.join(" ").toLowerCase();

  if (/product|readiness|spec|requirement/.test(objectivesText) || /launch/.test(intent.goal.toLowerCase())) {
    const product = getAgentDef("product")!;
    runs.push({
      agentId: product.id,
      goal: "Prepare product plan and structure",
      steps: [
        { tool: "createDocument", args: { title: `Product plan — ${intent.goal}`, body: intent.successCriteria.join("\n") }, note: "Draft product plan" },
        { tool: "createTask", args: { title: "Define acceptance criteria", missionId, priority: "high" }, note: "Create task" },
        { tool: "createTask", args: { title: "Prepare launch checklist", missionId, priority: "medium" }, note: "Create task" },
      ],
      artifact: { kind: "ProductSpec", title: `Product spec — ${intent.goal}`, content: intent.objectives.join("\n") },
    });
  }

  if (/engineering|technical|code|architecture/.test(objectivesText) || /launch/.test(intent.goal.toLowerCase())) {
    const eng = getAgentDef("engineering")!;
    runs.push({
      agentId: eng.id,
      goal: "Plan engineering work",
      steps: [
        { tool: "createTask", args: { title: "Break down engineering tasks", missionId, priority: "high", assignee: "Mike Reyes" }, note: "Create engineering task" },
        { tool: "createDocument", args: { title: `Technical plan — ${intent.goal}`, body: "Architecture, milestones, and test strategy." }, note: "Draft technical plan" },
      ],
      artifact: { kind: "TechnicalPlan", title: `Technical plan — ${intent.goal}`, content: "Milestones and test strategy." },
    });
  }

  if (/marketing|announcement|campaign|content|customer/.test(objectivesText) || /launch/.test(intent.goal.toLowerCase())) {
    const mkt = getAgentDef("marketing")!;
    runs.push({
      agentId: mkt.id,
      goal: "Draft marketing & launch materials",
      steps: [
        { tool: "createDocument", args: { title: `Launch plan — ${intent.goal}`, body: "Messaging, channels, and calendar." }, note: "Draft launch plan" },
        { tool: "createTask", args: { title: "Write launch announcement", missionId, priority: "medium", assignee: "Maya Patel" }, note: "Create task" },
      ],
      artifact: { kind: "MarketingPlan", title: `Marketing plan — ${intent.goal}`, content: "Channels and calendar." },
    });
  }

  if (/pipeline|sales|deal|revenue/.test(objectivesText)) {
    const analyst = getAgentDef("analyst")!;
    runs.push({
      agentId: analyst.id,
      goal: "Analyze pipeline and risks",
      steps: [
        { tool: "analyzeProjects", args: {}, note: "Analyze projects" },
        { tool: "createTask", args: { title: "Follow up on at-risk items", missionId, priority: "high" }, note: "Create follow-up" },
      ],
      artifact: { kind: "RiskReport", title: `Risk report — ${intent.goal}`, content: "At-risk items and follow-ups." },
    });
  }

  // If nothing objective-specific matched, add a QA/analysis pass so the
  // mission always does real work beyond research.
  if (runs.length === 1) {
    const analyst = getAgentDef("analyst")!;
    runs.push({
      agentId: analyst.id,
      goal: "Analyze workspace and produce recommendations",
      steps: [
        { tool: "analyzeProjects", args: {}, note: "Analyze projects" },
        { tool: "createTask", args: { title: `Next step for: ${intent.goal}`, missionId, priority: "medium" }, note: "Create next-step task" },
      ],
      artifact: { kind: "RiskReport", title: `Analysis — ${intent.goal}`, content: "Findings and recommendations." },
    });
  }

  // Mission plan steps (phases) shown in the UI, mapped from runs + closeout.
  const steps: MissionStep[] = [
    { id: uid("step"), title: "Research", status: "pending" },
    ...runs.slice(1).map((r) => ({ id: uid("step"), title: phaseName(r.agentId), status: "pending" as const, agentId: r.agentId })),
    { id: uid("step"), title: "Verification", status: "pending" },
    { id: uid("step"), title: "Monitoring", status: "pending" },
  ];

  const risks = deriveRisks(intent);

  return { steps, runs, risks };
}

function phaseName(agentId: string): string {
  return getAgentDef(agentId)?.role ?? "Work";
}

function keyword(goal: string): string {
  const g = goal.toLowerCase();
  if (/launch|product/.test(g)) return "product";
  if (/board|exec/.test(g)) return "strategy";
  if (/pipeline|sales/.test(g)) return "campaign";
  if (/churn|customer/.test(g)) return "customer";
  return goal.split(/\s+/).slice(0, 1)[0] ?? "";
}

function deriveRisks(intent: Intent): { label: string; level: "low" | "medium" | "high" }[] {
  const risks: { label: string; level: "low" | "medium" | "high" }[] = [];
  if (/deadline|launch|ship/i.test(intent.goal)) risks.push({ label: "Deadline pressure on critical path", level: "high" });
  if (intent.objectives.some((o) => /engineering|technical/i.test(o))) risks.push({ label: "API / engineering dependency", level: "medium" });
  if (intent.objectives.some((o) => /approval|design/i.test(o))) risks.push({ label: "Missing design approval", level: "medium" });
  if (risks.length === 0) risks.push({ label: "Incomplete workspace information", level: "low" });
  return risks;
}
