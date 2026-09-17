// Rover 2.0 — core domain model for the Autonomous Work OS.
// These types back real persisted state (via the Store abstraction), not
// display-only mock data. Every important entity carries an id, workspaceId,
// and timestamps.

export type ID = string;
export type ISODate = string;

export interface Entity {
  id: ID;
  workspaceId: ID;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ------------------------------------------------------------------ */
/* Workspace & people                                                  */
/* ------------------------------------------------------------------ */

export interface Workspace {
  id: ID;
  name: string;
  createdAt: ISODate;
}

export interface Member {
  id: ID;
  workspaceId: ID;
  name: string;
  initials: string;
  role: string;
  color: string;
}

/* ------------------------------------------------------------------ */
/* Work entities                                                       */
/* ------------------------------------------------------------------ */

export type ProjectStatus = "active" | "on-track" | "blocked" | "done" | "review" | "backlog";
export type Priority = "high" | "medium" | "low";

export interface Doc extends Entity {
  title: string;
  excerpt: string;
  body?: string;
  emoji: string;
  author: string;
  team: string;
  /** id of the AgentRun that created it, if any */
  createdByRun?: ID;
}

export interface Project extends Entity {
  name: string;
  status: ProjectStatus;
  owner: string;
  priority: Priority;
  due: string;
  insight: string;
  insightTone: "success" | "warning" | "error";
}

export interface Task extends Entity {
  title: string;
  projectId?: ID;
  missionId?: ID;
  status: ProjectStatus;
  assignee: string;
  priority: Priority;
  due: string;
  done?: boolean;
  createdByRun?: ID;
}

export interface Meeting extends Entity {
  title: string;
  date: string;
  time: string;
  participants: string[];
  summary: string;
  decisions: string[];
  actions: { who: string; what: string; done?: boolean }[];
}

/* ------------------------------------------------------------------ */
/* Missions & Intent                                                   */
/* ------------------------------------------------------------------ */

export type MissionStatus =
  | "DRAFT"
  | "PLANNING"
  | "WAITING_APPROVAL"
  | "EXECUTING"
  | "VERIFYING"
  | "MONITORING"
  | "BLOCKED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Intent {
  goal: string;
  objectives: string[];
  constraints: string[];
  successCriteria: string[];
}

export type MissionStepStatus = "pending" | "active" | "done" | "skipped";

export interface MissionStep {
  id: ID;
  title: string;
  status: MissionStepStatus;
  agentId?: ID;
}

export interface MissionRisk {
  id: ID;
  label: string;
  level: RiskLevel;
}

export interface Mission extends Entity {
  name: string;
  goal: string;
  originalIntent: string;
  intent: Intent;
  status: MissionStatus;
  progress: number; // 0..100
  priority: Priority;
  owner: string;
  deadline?: string;
  riskLevel: RiskLevel;
  plan: MissionStep[];
  successCriteria: string[];
  currentPhase: string;
  risks: MissionRisk[];
  runIds: ID[];
  outcome?: string;
  /** when true, mutating agent work is staged to the sandbox for review */
  sandboxMode: boolean;
}

/* ------------------------------------------------------------------ */
/* Agents & runtime                                                    */
/* ------------------------------------------------------------------ */

export type ToolRisk = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AgentDef {
  id: ID;
  name: string;
  role: string;
  description: string;
  /** tool ids this agent is permitted to call */
  tools: string[];
  /** knowledge scope: entity kinds it may read */
  knowledgeScope: string[];
  /** max risk this agent may execute without approval */
  autoApproveUpTo: ToolRisk;
  model: string;
}

export type AgentRunStatus =
  | "queued"
  | "planning"
  | "executing"
  | "waiting_approval"
  | "verifying"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface AgentToolCall {
  id: ID;
  runId: ID;
  tool: string;
  args: Record<string, unknown>;
  risk: ToolRisk;
  status: "ok" | "blocked" | "awaiting_approval" | "error" | "reverted";
  result?: unknown;
  error?: string;
  /** undo instructions captured at execution time */
  undo?: UndoOp[];
  evidenceIds: ID[];
  at: ISODate;
}

export type ArtifactKind =
  | "ResearchReport"
  | "ProductSpec"
  | "TechnicalPlan"
  | "DesignBrief"
  | "MarketingPlan"
  | "TestPlan"
  | "RiskReport"
  | "VerificationReport";

export interface AgentArtifact {
  id: ID;
  runId: ID;
  kind: ArtifactKind;
  title: string;
  content: string;
  createdAt: ISODate;
}

export interface AgentMessage {
  id: ID;
  runId: ID;
  role: "planner" | "agent" | "tool" | "verifier" | "system";
  text: string;
  at: ISODate;
}

export interface AgentRun {
  id: ID;
  workspaceId: ID;
  missionId?: ID;
  agentId: ID;
  agentName: string;
  goal: string;
  status: AgentRunStatus;
  plannedSteps: string[];
  toolCallIds: ID[];
  artifactIds: ID[];
  messageIds: ID[];
  verificationId?: ID;
  startedAt: ISODate;
  finishedAt?: ISODate;
  durationMs?: number;
}

/* ------------------------------------------------------------------ */
/* Safety: evidence, approvals, verification, undo, activity           */
/* ------------------------------------------------------------------ */

export interface Evidence {
  id: ID;
  workspaceId: ID;
  claim: string;
  sourceType: string; // "document" | "project" | "task" | "meeting" | ...
  sourceId: ID;
  sourceLabel: string;
  section?: string;
  confidence: number; // 0..1
  relationship: string; // "supports" | "contradicts" | "context"
  at: ISODate;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Approval {
  id: ID;
  workspaceId: ID;
  runId: ID;
  missionId?: ID;
  toolCallId?: ID;
  title: string;
  detail: string;
  risk: ToolRisk;
  status: ApprovalStatus;
  requestedAt: ISODate;
  decidedAt?: ISODate;
}

export interface VerificationCheck {
  criterion: string;
  passed: boolean;
  reason: string;
  evidenceIds: ID[];
}

export interface VerificationReport {
  id: ID;
  runId: ID;
  missionId?: ID;
  passed: boolean;
  score: number; // 0..1 fraction of criteria met
  checks: VerificationCheck[];
  summary: string;
  at: ISODate;
}

/** A reversible operation captured when a tool mutates the store. */
export type UndoOp =
  | { kind: "delete"; collection: CollectionName; id: ID }
  | { kind: "restore"; collection: CollectionName; snapshot: unknown };

export interface Activity {
  id: ID;
  workspaceId: ID;
  actor: string; // agent name or user
  action: string;
  target?: string;
  runId?: ID;
  missionId?: ID;
  at: ISODate;
}

/* ------------------------------------------------------------------ */
/* Decision Memory                                                     */
/* ------------------------------------------------------------------ */

export type DecisionStatus = "active" | "superseded" | "revisiting";

export interface Decision extends Entity {
  decision: string;
  rationale: string;
  people: string[];
  alternatives: string[];
  /** entity refs affected by this decision */
  affects: { type: string; id: ID; label: string }[];
  evidenceIds: ID[];
  status: DecisionStatus;
  source: string; // e.g. "Meeting: Product Strategy" | "Mission: Launch"
  sourceId?: ID;
  date: string;
}

/* ------------------------------------------------------------------ */
/* Sandbox — staged, reviewable changes before they touch the store    */
/* ------------------------------------------------------------------ */

export type SandboxOpKind = "create" | "update" | "delete";
export type SandboxStatus = "staged" | "applied" | "rejected";

export interface SandboxChange {
  id: ID;
  workspaceId: ID;
  runId: ID;
  agentName: string;
  missionId?: ID;
  op: SandboxOpKind;
  collection: CollectionName;
  /** the entity to create / the patch to apply / the id to delete */
  payload: Record<string, unknown>;
  entityId: ID;
  label: string;
  risk: ToolRisk;
  status: SandboxStatus;
  at: ISODate;
}

/* ------------------------------------------------------------------ */
/* Simulation / What-if (transient — never mutates live data)          */
/* ------------------------------------------------------------------ */

export type SimulationKind =
  | "delay_deadline"
  | "cancel_project"
  | "remove_feature"
  | "add_capacity"
  | "do_nothing";

export interface SimulationChange {
  type: string; // affected entity kind
  id: ID;
  label: string;
  effect: string; // human-readable projected effect
  severity: "info" | "warning" | "critical";
}

export interface Simulation {
  id: ID;
  kind: SimulationKind;
  targetId?: ID;
  targetLabel: string;
  change: string; // e.g. "Launch date +14 days"
  affected: SimulationChange[];
  conflicts: string[];
  risks: string[];
  summary: string;
  at: ISODate;
}

/* ------------------------------------------------------------------ */
/* Watchers — persistent scope monitors                                */
/* ------------------------------------------------------------------ */

export type WatcherScopeKind = "mission" | "project" | "database" | "workspace";
export type WatcherSignal = "deadlines" | "blockers" | "requirements" | "velocity" | "risk";
export type WatcherTrigger = "risk_increases" | "deadline_changes" | "new_blocker" | "requirement_conflict";

export interface WatcherAlert {
  id: ID;
  message: string;
  severity: "info" | "warning" | "critical";
  at: ISODate;
  acknowledged: boolean;
  launchedMissionId?: ID;
}

export interface Watcher extends Entity {
  name: string;
  scopeKind: WatcherScopeKind;
  scopeId?: ID;
  scopeLabel: string;
  signals: WatcherSignal[];
  triggers: WatcherTrigger[];
  /** if true, a triggered watcher auto-launches a mission */
  autoLaunch: boolean;
  enabled: boolean;
  lastChecked?: ISODate;
  alerts: WatcherAlert[];
}

/* ------------------------------------------------------------------ */
/* Shadow Rover — observed patterns -> suggestions                     */
/* ------------------------------------------------------------------ */

export interface ShadowSuggestion {
  id: ID;
  title: string;
  observation: string;
  suggestion: string;
  kind: "automation" | "agent" | "template";
  confidence: number; // 0..1
  goal: string; // the goal to launch if converted
}

/* ------------------------------------------------------------------ */
/* Store shape                                                         */
/* ------------------------------------------------------------------ */

export interface RoverState {
  workspace: Workspace;
  members: Member[];
  docs: Doc[];
  projects: Project[];
  tasks: Task[];
  meetings: Meeting[];
  missions: Mission[];
  agents: AgentDef[];
  runs: AgentRun[];
  toolCalls: AgentToolCall[];
  artifacts: AgentArtifact[];
  messages: AgentMessage[];
  evidence: Evidence[];
  approvals: Approval[];
  verifications: VerificationReport[];
  activity: Activity[];
  decisions: Decision[];
  sandbox: SandboxChange[];
  watchers: Watcher[];
}

export type CollectionName = keyof Omit<RoverState, "workspace">;
