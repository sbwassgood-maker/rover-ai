// Built-in specialized agents. Each agent operates ONLY through the explicit
// tools listed here and within its knowledge scope — no agent has unrestricted
// access. autoApproveUpTo caps the risk an agent may execute without a human
// approval (the Agent Firewall enforces this).

import type { AgentDef } from "./types";

const WS = "ws_default";
const base = { workspaceId: WS } as const;

export const agentDefs: AgentDef[] = [
  {
    id: "orchestrator",
    name: "Orchestrator",
    role: "Mission lead",
    description: "Turns a mission plan into work, delegates to specialized agents, and assembles the outcome.",
    tools: ["searchWorkspace", "createMissionStep", "completeMissionStep", "findRelatedEntities"],
    knowledgeScope: ["missions", "docs", "projects", "tasks", "meetings"],
    autoApproveUpTo: "MEDIUM",
    model: "reasoning",
  },
  {
    id: "research",
    name: "Research Agent",
    role: "Researcher",
    description: "Researches workspace data (and, when connected, external sources) and produces a research report with evidence.",
    tools: ["searchWorkspace", "readDocument", "searchMeetings", "findRelatedEntities"],
    knowledgeScope: ["docs", "meetings", "projects", "tasks"],
    autoApproveUpTo: "LOW",
    model: "reasoning",
  },
  {
    id: "product",
    name: "Product Agent",
    role: "Product manager",
    description: "Creates product requirements, specs, plans and project structure.",
    tools: ["searchWorkspace", "createDocument", "createProject", "createTask"],
    knowledgeScope: ["docs", "projects", "tasks"],
    autoApproveUpTo: "MEDIUM",
    model: "reasoning",
  },
  {
    id: "engineering",
    name: "Engineering Agent",
    role: "Engineer",
    description: "Plans technical work, breaks specs into engineering tasks, and drafts technical documentation.",
    tools: ["searchWorkspace", "readDocument", "createTask", "createDocument"],
    knowledgeScope: ["docs", "projects", "tasks"],
    autoApproveUpTo: "MEDIUM",
    model: "coding",
  },
  {
    id: "design",
    name: "Design Agent",
    role: "Designer",
    description: "Produces UX specifications and design tasks.",
    tools: ["searchWorkspace", "createDocument", "createTask"],
    knowledgeScope: ["docs", "projects", "tasks"],
    autoApproveUpTo: "MEDIUM",
    model: "reasoning",
  },
  {
    id: "marketing",
    name: "Marketing Agent",
    role: "Marketer",
    description: "Creates launch plans, campaigns, messaging and content.",
    tools: ["searchWorkspace", "createDocument", "createTask"],
    knowledgeScope: ["docs", "projects"],
    autoApproveUpTo: "MEDIUM",
    model: "fast",
  },
  {
    id: "qa",
    name: "QA Agent",
    role: "Quality",
    description: "Reviews requirements and results, identifies missing cases, and produces test plans.",
    tools: ["searchWorkspace", "readDocument", "createTask"],
    knowledgeScope: ["docs", "projects", "tasks"],
    autoApproveUpTo: "LOW",
    model: "reasoning",
  },
  {
    id: "analyst",
    name: "Analyst Agent",
    role: "Analyst",
    description: "Analyzes databases and metrics and reports insights with evidence.",
    tools: ["searchWorkspace", "analyzeProjects", "findRelatedEntities", "traceDependency", "findImpact"],
    knowledgeScope: ["projects", "tasks"],
    autoApproveUpTo: "LOW",
    model: "reasoning",
  },
  {
    id: "reviewer",
    name: "Reviewer Agent",
    role: "Independent verifier",
    description: "Independently verifies important work against success criteria and evidence.",
    tools: ["searchWorkspace", "readDocument"],
    knowledgeScope: ["docs", "projects", "tasks", "missions"],
    autoApproveUpTo: "LOW",
    model: "reasoning",
  },
  {
    id: "pm",
    name: "Project Manager Agent",
    role: "Delivery",
    description: "Monitors progress, dependencies, risks and deadlines.",
    tools: ["searchWorkspace", "analyzeProjects", "findRelatedEntities", "traceDependency", "findImpact", "createTask"],
    knowledgeScope: ["projects", "tasks", "missions"],
    autoApproveUpTo: "MEDIUM",
    model: "fast",
  },
];

export function getAgentDef(id: string): AgentDef | undefined {
  return agentDefs.find((a) => a.id === id);
}
