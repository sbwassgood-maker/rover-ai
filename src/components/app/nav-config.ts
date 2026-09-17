import {
  Home,
  Inbox,
  Sparkles,
  Search,
  Bot,
  FileText,
  FolderKanban,
  Table2,
  CalendarDays,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon; ai?: boolean };

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/app", icon: Home },
  { label: "Inbox", href: "/app/inbox", icon: Inbox },
  { label: "Ask Rover", href: "/app/ask", icon: Sparkles, ai: true },
  { label: "Search", href: "/app/search", icon: Search },
  { label: "Agents", href: "/app/agents", icon: Bot },
];

export const workspaceNav: NavItem[] = [
  { label: "Docs", href: "/app/docs", icon: FileText },
  { label: "Projects", href: "/app/projects", icon: FolderKanban },
  { label: "Databases", href: "/app/databases", icon: Table2 },
  { label: "Meetings", href: "/app/meetings", icon: CalendarDays },
  { label: "Automations", href: "/app/automations", icon: Zap },
];

export const teamNav = ["Marketing", "Engineering", "Product", "Sales"];
