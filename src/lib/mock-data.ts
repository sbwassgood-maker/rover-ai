// Central mock data used across the marketing mockups and the workspace app.
// This is illustrative sample data only — no real backend is connected.

export type Status = "active" | "on-track" | "blocked" | "done" | "review" | "backlog";
export type Priority = "high" | "medium" | "low";

export const currentUser = {
  name: "Alex",
  fullName: "Alex Morgan",
  email: "alex@northstar.co",
  initials: "AM",
  role: "Product Lead",
};

export const teamMembers = [
  { id: "sarah", name: "Sarah Chen", initials: "SC", color: "#635BFF", role: "Design" },
  { id: "alex", name: "Alex Morgan", initials: "AM", color: "#22A06B", role: "Product" },
  { id: "mike", name: "Mike Reyes", initials: "MR", color: "#E6A700", role: "Engineering" },
  { id: "maya", name: "Maya Patel", initials: "MP", color: "#E5484D", role: "Marketing" },
  { id: "jon", name: "Jon Okafor", initials: "JO", color: "#8B7CFF", role: "Sales" },
];

export const teams = ["Marketing", "Engineering", "Sales", "Product"];

export type Doc = {
  id: string;
  title: string;
  excerpt: string;
  emoji: string;
  updated: string;
  author: string;
  team: string;
};

export const docs: Doc[] = [
  { id: "q4-strategy", title: "Q4 Product Strategy", excerpt: "Our Q4 strategy focuses on improving activation, retention, and expansion.", emoji: "◆", updated: "2h ago", author: "Alex Morgan", team: "Product" },
  { id: "roadmap", title: "Product Roadmap", excerpt: "The living roadmap across all squads for the next two quarters.", emoji: "▣", updated: "Yesterday", author: "Sarah Chen", team: "Product" },
  { id: "q4-marketing", title: "Q4 Marketing Plan", excerpt: "Campaign calendar, budget allocation and channel strategy.", emoji: "◈", updated: "3h ago", author: "Maya Patel", team: "Marketing" },
  { id: "customer-research", title: "Customer Research", excerpt: "Synthesis of 42 interviews on onboarding and activation friction.", emoji: "◇", updated: "2d ago", author: "Sarah Chen", team: "Product" },
  { id: "eng-weekly", title: "Engineering Weekly", excerpt: "Weekly status across platform, mobile and infrastructure.", emoji: "▦", updated: "1d ago", author: "Mike Reyes", team: "Engineering" },
  { id: "launch-strategy", title: "Launch Strategy", excerpt: "Go-to-market plan for the new workspace experience.", emoji: "✦", updated: "5h ago", author: "Alex Morgan", team: "Product" },
];

export type Project = {
  id: string;
  name: string;
  status: Status;
  owner: string;
  priority: Priority;
  due: string;
  insight: string;
  insightTone: "success" | "warning" | "error";
};

export const projects: Project[] = [
  { id: "website", name: "Website redesign", status: "active", owner: "Sarah Chen", priority: "high", due: "Fri", insight: "3 blockers", insightTone: "error" },
  { id: "mobile", name: "Mobile app", status: "on-track", owner: "Alex Morgan", priority: "medium", due: "Apr 14", insight: "Launch ready", insightTone: "success" },
  { id: "crm", name: "CRM migration", status: "blocked", owner: "Mike Reyes", priority: "high", due: "Tue", insight: "API access needed", insightTone: "error" },
  { id: "campaign", name: "Marketing campaign", status: "active", owner: "Maya Patel", priority: "medium", due: "Mon", insight: "Strong results", insightTone: "success" },
  { id: "billing", name: "Billing integration", status: "blocked", owner: "Mike Reyes", priority: "high", due: "Tue", insight: "Vendor review", insightTone: "warning" },
  { id: "onboarding", name: "Onboarding revamp", status: "review", owner: "Sarah Chen", priority: "medium", due: "Thu", insight: "In review", insightTone: "warning" },
];

export const statusMeta: Record<Status, { label: string; tone: "success" | "warning" | "error" | "ai" | "muted" }> = {
  active: { label: "Active", tone: "success" },
  "on-track": { label: "On track", tone: "success" },
  blocked: { label: "Blocked", tone: "error" },
  done: { label: "Done", tone: "muted" },
  review: { label: "In review", tone: "warning" },
  backlog: { label: "Backlog", tone: "muted" },
};

export type Task = {
  id: string;
  title: string;
  status: Status;
  assignee: string;
  priority: Priority;
  due: string;
  done?: boolean;
};

export const boardColumns: { id: Status; title: string; tasks: Task[] }[] = [
  {
    id: "backlog",
    title: "Backlog",
    tasks: [
      { id: "t1", title: "Research competitor onboarding", status: "backlog", assignee: "Sarah Chen", priority: "medium", due: "—" },
      { id: "t2", title: "Analytics instrumentation plan", status: "backlog", assignee: "Mike Reyes", priority: "low", due: "—" },
      { id: "t3", title: "Integrations audit", status: "backlog", assignee: "Jon Okafor", priority: "low", due: "—" },
    ],
  },
  {
    id: "active",
    title: "In progress",
    tasks: [
      { id: "t4", title: "New homepage hero", status: "active", assignee: "Sarah Chen", priority: "high", due: "Fri" },
      { id: "t5", title: "Workspace dashboard", status: "active", assignee: "Alex Morgan", priority: "high", due: "Mon" },
      { id: "t6", title: "Global search backend", status: "active", assignee: "Mike Reyes", priority: "high", due: "Wed" },
    ],
  },
  {
    id: "review",
    title: "In review",
    tasks: [
      { id: "t7", title: "Pricing page copy", status: "review", assignee: "Maya Patel", priority: "medium", due: "Thu" },
      { id: "t8", title: "Onboarding flow", status: "review", assignee: "Sarah Chen", priority: "high", due: "Thu" },
    ],
  },
  {
    id: "done",
    title: "Done",
    tasks: [
      { id: "t9", title: "Brand logo system", status: "done", assignee: "Sarah Chen", priority: "medium", due: "—", done: true },
      { id: "t10", title: "Sitemap & IA", status: "done", assignee: "Alex Morgan", priority: "low", due: "—", done: true },
      { id: "t11", title: "Auth service", status: "done", assignee: "Mike Reyes", priority: "high", due: "—", done: true },
    ],
  },
];

export const homeTasks: Task[] = [
  { id: "h1", title: "Review Q4 activation targets", status: "active", assignee: "Alex Morgan", priority: "high", due: "Today" },
  { id: "h2", title: "Approve onboarding proposal", status: "active", assignee: "Alex Morgan", priority: "high", due: "Today" },
  { id: "h3", title: "Comment on launch strategy", status: "active", assignee: "Alex Morgan", priority: "medium", due: "Tomorrow" },
  { id: "h4", title: "Sync with Engineering on API", status: "active", assignee: "Alex Morgan", priority: "medium", due: "Wed" },
];

export type Agent = {
  id: string;
  name: string;
  description: string;
  status: "active" | "scheduled" | "working" | "paused";
  lastRun: string;
  nextRun: string;
  completed: number;
  schedule: string;
};

export const agents: Agent[] = [
  { id: "brief", name: "Weekly Executive Brief", description: "Every Monday, review company metrics, project updates, customer feedback and important meetings, then create a concise executive briefing.", status: "active", lastRun: "Today, 8:00 AM", nextRun: "Mon, 8:00 AM", completed: 128, schedule: "Every Monday · 8:00 AM" },
  { id: "insights", name: "Customer Insights", description: "Analyzes customer feedback and identifies emerging trends across support and interviews.", status: "active", lastRun: "Today, 6:00 AM", nextRun: "Tomorrow, 6:00 AM", completed: 342, schedule: "Daily · 6:00 AM" },
  { id: "research", name: "Research Agent", description: "Researches topics and creates structured reports with sources.", status: "paused", lastRun: "3 days ago", nextRun: "Manual", completed: 47, schedule: "Manual" },
  { id: "content", name: "Content Agent", description: "Turns product updates into publish-ready content for the blog and changelog.", status: "active", lastRun: "Yesterday", nextRun: "On demand", completed: 89, schedule: "On demand" },
];

export const agentStatusMeta = {
  active: { label: "Active", tone: "success" as const },
  scheduled: { label: "Scheduled", tone: "ai" as const },
  working: { label: "Working", tone: "warning" as const },
  paused: { label: "Paused", tone: "muted" as const },
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: string[];
  summary: string;
  decisions: string[];
  actions: { who: string; what: string; done?: boolean }[];
};

export const meetings: Meeting[] = [
  {
    id: "product-strategy",
    title: "Product Strategy",
    date: "September 17",
    time: "10:00 AM",
    participants: ["Sarah Chen", "Alex Morgan", "Mike Reyes", "Maya Patel"],
    summary: "The team agreed to prioritize onboarding improvements for Q4 and move the launch to April 14.",
    decisions: ["Simplify signup flow", "Add guided onboarding", "Measure activation rate", "Launch date: April 14"],
    actions: [
      { who: "Sarah Chen", what: "Draft onboarding proposal" },
      { who: "Alex Morgan", what: "Review analytics" },
      { who: "Mike Reyes", what: "Estimate engineering effort" },
    ],
  },
  {
    id: "gtm-sync",
    title: "Go-to-market Sync",
    date: "September 16",
    time: "2:00 PM",
    participants: ["Maya Patel", "Jon Okafor", "Alex Morgan"],
    summary: "Aligned on messaging and channel priorities for the launch campaign.",
    decisions: ["Lead with 'intelligent workspace'", "Prioritize product-led growth", "Beta begins March 20"],
    actions: [
      { who: "Maya Patel", what: "Finalize campaign calendar" },
      { who: "Jon Okafor", what: "Brief sales team" },
    ],
  },
];

export const integrations = [
  { name: "Slack", glyph: "S" },
  { name: "Google Drive", glyph: "D" },
  { name: "Gmail", glyph: "M" },
  { name: "GitHub", glyph: "G" },
  { name: "Linear", glyph: "L" },
  { name: "Jira", glyph: "J" },
  { name: "Notion", glyph: "N" },
  { name: "Microsoft Teams", glyph: "T" },
  { name: "Salesforce", glyph: "SF" },
  { name: "HubSpot", glyph: "H" },
  { name: "Dropbox", glyph: "Db" },
  { name: "PostgreSQL", glyph: "Pg" },
];

export const aiActivity = [
  "Weekly report generated",
  "Customer feedback analyzed",
  "14 documents summarized",
  "Marketing brief created",
];

export const suggestedPrompts = [
  "Summarize my workspace",
  "What needs my attention?",
  "Create a project plan",
  "Find our latest customer insights",
  "Draft a weekly report",
];

// Placeholder testimonials — replace with real, approved quotes before launch.
export const testimonials = [
  { quote: "Rover gives our team one place to think, write, and find what we need.", name: "Customer Name", role: "Head of Product", company: "Placeholder Co." },
  { quote: "We stopped searching and started asking. Answers now take seconds, not hours.", name: "Customer Name", role: "Operations Lead", company: "Placeholder Inc." },
  { quote: "The agents handle our weekly reporting end to end. It feels like extra teammates.", name: "Customer Name", role: "Chief of Staff", company: "Placeholder Ltd." },
];

// Placeholder company marks — replace with real, approved logos.
export const socialProof = ["Northstar", "Vertex", "Meridian", "Atlas", "Frame", "Nova"];
