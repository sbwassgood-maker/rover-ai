"use client";
import { Badge, StatusDot } from "@/components/ui/Card";
import type { MissionStatus, AgentRunStatus, RiskLevel, ToolRisk } from "@/rover/types";

const missionMeta: Record<MissionStatus, { label: string; tone: "neutral" | "ai" | "success" | "warning" | "error" }> = {
  DRAFT: { label: "Draft", tone: "neutral" },
  PLANNING: { label: "Planning", tone: "ai" },
  WAITING_APPROVAL: { label: "Waiting for you", tone: "warning" },
  EXECUTING: { label: "Executing", tone: "ai" },
  VERIFYING: { label: "Verifying", tone: "ai" },
  MONITORING: { label: "Monitoring", tone: "success" },
  BLOCKED: { label: "Needs revision", tone: "error" },
  COMPLETED: { label: "Completed", tone: "success" },
  FAILED: { label: "Failed", tone: "error" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export function MissionStatusBadge({ status }: { status: MissionStatus }) {
  const m = missionMeta[status];
  const pulse = status === "EXECUTING" || status === "VERIFYING" || status === "PLANNING";
  return (
    <Badge tone={m.tone}>
      <StatusDot tone={m.tone === "neutral" ? "muted" : m.tone} pulse={pulse} />
      {m.label}
    </Badge>
  );
}

const runMeta: Record<AgentRunStatus, { label: string; tone: "neutral" | "ai" | "success" | "warning" | "error" }> = {
  queued: { label: "Queued", tone: "neutral" },
  planning: { label: "Planning", tone: "ai" },
  executing: { label: "Executing", tone: "ai" },
  waiting_approval: { label: "Waiting approval", tone: "warning" },
  verifying: { label: "Verifying", tone: "ai" },
  succeeded: { label: "Succeeded", tone: "success" },
  failed: { label: "Failed", tone: "error" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export function RunStatusBadge({ status }: { status: AgentRunStatus }) {
  const m = runMeta[status];
  return (
    <Badge tone={m.tone}>
      <StatusDot tone={m.tone === "neutral" ? "muted" : m.tone} pulse={status === "executing" || status === "verifying"} />
      {m.label}
    </Badge>
  );
}

const riskTone: Record<RiskLevel, "success" | "warning" | "error"> = {
  low: "success",
  medium: "warning",
  high: "error",
  critical: "error",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <Badge tone={riskTone[level]}>{level[0].toUpperCase() + level.slice(1)} risk</Badge>;
}

const toolRiskTone: Record<ToolRisk, "success" | "warning" | "error" | "neutral"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "error",
  CRITICAL: "error",
};

export function ToolRiskChip({ risk }: { risk: ToolRisk }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-semibold ${
        toolRiskTone[risk] === "success" ? "bg-success/10 text-success"
          : toolRiskTone[risk] === "warning" ? "bg-warning/10 text-[#8a6600]"
          : toolRiskTone[risk] === "error" ? "bg-error/10 text-error"
          : "bg-ink/5 text-muted"
      }`}
    >
      {risk}
    </span>
  );
}
