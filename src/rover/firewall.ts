// Agent Firewall — every tool call passes through here before execution.
// It enforces permission (is the tool in the agent's allow-list?), scope
// (is the tool's data within the agent's knowledge scope?), and risk policy
// (does this risk exceed the agent's auto-approve ceiling?). High-risk calls
// produce a pending Approval and are NOT executed until approved.

import type { AgentDef, ToolRisk } from "./types";
import type { ToolDef } from "./tools";

const riskOrder: Record<ToolRisk, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

export interface FirewallDecision {
  allow: boolean;
  /** true when blocked specifically because approval is required */
  requiresApproval: boolean;
  reason: string;
}

export function evaluate(agent: AgentDef, tool: ToolDef): FirewallDecision {
  // 1. Permission — tool must be explicitly granted to the agent.
  if (!agent.tools.includes(tool.name)) {
    return {
      allow: false,
      requiresApproval: false,
      reason: `${agent.name} is not permitted to use ${tool.name}.`,
    };
  }

  // 2. Risk policy — anything above the agent's ceiling needs approval.
  if (riskOrder[tool.risk] > riskOrder[agent.autoApproveUpTo]) {
    return {
      allow: false,
      requiresApproval: true,
      reason: `${tool.risk} action exceeds ${agent.name}'s auto-approve limit (${agent.autoApproveUpTo}).`,
    };
  }

  return { allow: true, requiresApproval: false, reason: "" };
}

export function isCritical(risk: ToolRisk): boolean {
  return risk === "CRITICAL";
}
