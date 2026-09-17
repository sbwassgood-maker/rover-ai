import {
  LayoutDashboard,
  Rocket,
  Inbox,
  Sparkles,
  Search,
  Bot,
  FileText,
  FolderKanban,
  Table2,
  CalendarDays,
  Zap,
  Share2,
  GitBranch,
  ShieldCheck,
  ScrollText,
  Radar,
  FlaskConical,
  Eye,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon; ai?: boolean };

export const primaryNav: NavItem[] = [
  { label: "Mission Control", href: "/app", icon: LayoutDashboard, ai: true },
  { label: "Missions", href: "/app/missions", icon: Rocket },
  { label: "Ask Rover", href: "/app/ask", icon: Sparkles, ai: true },
  { label: "Search", href: "/app/search", icon: Search },
  { label: "Agents", href: "/app/agents", icon: Bot },
  { label: "Approvals", href: "/app/approvals", icon: ShieldCheck },
  { label: "Inbox", href: "/app/inbox", icon: Inbox },
];

// Radar — proactive / predictive surfaces
export const radarNav: NavItem[] = [
  { label: "Simulate", href: "/app/simulate", icon: FlaskConical, ai: true },
  { label: "Watchers", href: "/app/watchers", icon: Radar },
  { label: "Shadow Rover", href: "/app/shadow", icon: Eye, ai: true },
];

// Rover intelligence & governance surfaces
export const roverNav: NavItem[] = [
  { label: "Work Graph", href: "/app/graph", icon: Share2 },
  { label: "Decisions", href: "/app/decisions", icon: GitBranch },
  { label: "Audit log", href: "/app/audit", icon: ScrollText },
];

export const workspaceNav: NavItem[] = [
  { label: "Docs", href: "/app/docs", icon: FileText },
  { label: "Projects", href: "/app/projects", icon: FolderKanban },
  { label: "Databases", href: "/app/databases", icon: Table2 },
  { label: "Meetings", href: "/app/meetings", icon: CalendarDays },
  { label: "Automations", href: "/app/automations", icon: Zap },
];

export const teamNav = ["Marketing", "Engineering", "Product", "Sales"];
