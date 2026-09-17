// Shadow Rover — read-only observation. Scans the workspace for repetitive
// patterns and proposes automations/agents. It never changes anything; each
// suggestion can be converted into a mission by the user.

import type { RoverState, ShadowSuggestion } from "./types";

export function detectPatterns(s: RoverState): ShadowSuggestion[] {
  const out: ShadowSuggestion[] = [];

  // 1. Meetings produce decisions/actions that become tasks — automate it.
  const meetingsWithActions = s.meetings.filter((m) => m.actions.length > 0);
  if (meetingsWithActions.length >= 1) {
    const totalActions = meetingsWithActions.reduce((n, m) => n + m.actions.length, 0);
    out.push({
      id: "shadow_meeting_tasks",
      title: "Meeting → task automation",
      observation: `${meetingsWithActions.length} meeting(s) contain ${totalActions} action item(s) that are converted into tasks by hand.`,
      suggestion: "Let Rover turn every meeting's action items into assigned tasks automatically.",
      kind: "automation",
      confidence: 0.86,
      goal: "Convert meeting action items into assigned tasks",
    });
  }

  // 2. Repeated project structure — template opportunity.
  const activeProjects = s.projects.filter((p) => p.status === "active" || p.status === "on-track");
  if (activeProjects.length >= 3) {
    out.push({
      id: "shadow_project_template",
      title: "Project template automation",
      observation: `${s.projects.length} projects share a similar structure (owner, priority, due date).`,
      suggestion: "Create a standard project template so new projects start consistent.",
      kind: "template",
      confidence: 0.72,
      goal: "Create a standard project template for the team",
    });
  }

  // 3. Weekly reviewing — recurring briefing agent.
  out.push({
    id: "shadow_weekly_brief",
    title: "Weekly executive briefing",
    observation: "You review project status and metrics on a recurring basis.",
    suggestion: "Schedule a Weekly Executive Brief agent to assemble this every Monday.",
    kind: "agent",
    confidence: 0.8,
    goal: "Prepare a weekly executive briefing every Monday",
  });

  // 4. At-risk projects with no mission — proactive unblock.
  const atRisk = s.projects.filter((p) => p.status === "blocked" || p.insightTone === "error");
  if (atRisk.length >= 1) {
    out.push({
      id: "shadow_unblock",
      title: "Proactive unblocking",
      observation: `${atRisk.length} project(s) are currently at risk with no active mission addressing them.`,
      suggestion: "Launch a mission to find and clear what's blocking the team.",
      kind: "automation",
      confidence: 0.9,
      goal: "Find what's blocking the team and propose fixes",
    });
  }

  return out.sort((a, b) => b.confidence - a.confidence);
}
