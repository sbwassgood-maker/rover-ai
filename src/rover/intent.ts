// Intent Engine — extracts the user's real goal (objectives, constraints,
// success criteria) from a raw request. Implemented as a deterministic local
// engine behind an interface so a model-backed engine can replace it later
// without changing callers.

import type { Intent } from "./types";

export interface IntentEngine {
  extract(rawGoal: string): Intent;
}

type Template = {
  match: RegExp;
  objectives: string[];
  constraints: string[];
  successCriteria: string[];
  phase: string;
};

const templates: Template[] = [
  {
    match: /launch|ship|release|go[- ]?to[- ]?market/i,
    objectives: [
      "Product readiness",
      "Engineering readiness",
      "Marketing readiness",
      "Customer readiness",
      "Operational readiness",
    ],
    constraints: ["Respect the deadline", "Stay within existing team capacity"],
    successCriteria: [
      "Product is ready and QA is complete",
      "Documentation is complete",
      "Launch materials are ready",
      "A launch plan exists with owners and dates",
    ],
    phase: "Research",
  },
  {
    match: /board|investor|exec|leadership|meeting prep|prepare.*meeting/i,
    objectives: [
      "Gather current metrics",
      "Summarize progress and risks",
      "Prepare an executive narrative",
      "Assemble supporting evidence",
    ],
    constraints: ["Use only verified workspace data", "Keep it concise"],
    successCriteria: [
      "A briefing document exists",
      "Key metrics are summarized",
      "Risks and decisions needed are listed with evidence",
    ],
    phase: "Research",
  },
  {
    match: /pipeline|sales|revenue|opportunit|deals?/i,
    objectives: [
      "Analyze current pipeline",
      "Identify at-risk opportunities",
      "Recommend follow-ups",
    ],
    constraints: ["Base conclusions on workspace data"],
    successCriteria: [
      "Pipeline is analyzed",
      "At-risk deals are identified with reasons",
      "Follow-up tasks are created",
    ],
    phase: "Analysis",
  },
  {
    match: /clean ?up|organize|tidy|maintain/i,
    objectives: [
      "Audit the current state",
      "Identify stale or duplicate items",
      "Propose a cleaner structure",
    ],
    constraints: ["Do not delete without approval"],
    successCriteria: [
      "An audit exists",
      "Cleanup actions are proposed with a diff",
      "No data was destroyed without approval",
    ],
    phase: "Audit",
  },
  {
    match: /research|market|competit|analy[sz]e (?!.*pipeline)/i,
    objectives: [
      "Define the research questions",
      "Gather relevant information",
      "Synthesize findings",
    ],
    constraints: ["Cite sources for every claim"],
    successCriteria: [
      "A research report exists",
      "Findings are backed by evidence",
      "Recommendations are provided",
    ],
    phase: "Research",
  },
  {
    match: /hir(e|ing)|recruit|staff|team plan/i,
    objectives: [
      "Assess current capacity",
      "Define roles needed",
      "Draft a hiring plan",
    ],
    constraints: ["Align with budget and timeline"],
    successCriteria: [
      "Roles and priorities are defined",
      "A hiring plan document exists",
      "Onboarding tasks are outlined",
    ],
    phase: "Planning",
  },
  {
    match: /block|risk|stuck|behind|at risk|blocker/i,
    objectives: [
      "Scan projects and tasks",
      "Identify blockers and dependencies",
      "Recommend unblocking actions",
    ],
    constraints: ["Prioritize by impact"],
    successCriteria: [
      "Blockers are identified with owners",
      "Impact is explained with evidence",
      "Unblocking actions are proposed",
    ],
    phase: "Analysis",
  },
];

const fallback: Omit<Template, "match"> = {
  objectives: ["Understand the current state", "Plan the work", "Execute and verify"],
  constraints: ["Stay aligned to the stated goal"],
  successCriteria: [
    "The stated goal is addressed",
    "Work is backed by evidence",
    "A clear outcome is produced",
  ],
  phase: "Research",
};

export class LocalIntentEngine implements IntentEngine {
  extract(rawGoal: string): Intent {
    const t = templates.find((x) => x.match.test(rawGoal)) ?? fallback;
    const goal = normalizeGoal(rawGoal);
    return {
      goal,
      objectives: t.objectives,
      constraints: t.constraints,
      successCriteria: t.successCriteria,
    };
  }

  /** Exposed so the planner can reuse the matched starting phase. */
  phaseFor(rawGoal: string): string {
    return (templates.find((x) => x.match.test(rawGoal)) ?? fallback).phase;
  }
}

function normalizeGoal(raw: string): string {
  const s = raw.trim().replace(/\s+/g, " ");
  if (!s) return "Complete the requested work";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const intentEngine = new LocalIntentEngine();
