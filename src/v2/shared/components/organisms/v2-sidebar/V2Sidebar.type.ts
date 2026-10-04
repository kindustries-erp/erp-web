import type { LucideIcon } from "lucide-react";

export interface V2SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badgeCount?: number;
}

export type V2SidebarNavItem = V2SidebarItem;

export interface V2SidebarSectionData {
  id: string;
  label?: string;
  items: V2SidebarItem[];
}

export interface V2SidebarUserData {
  displayName?: string;
  avatarInitials?: string;
  unreadCount?: number;
}

export interface V2SidebarProps {
  sections?: V2SidebarSectionData[];
  items?: V2SidebarItem[];
  activeId?: string;
  onNavigate?: (item: V2SidebarItem) => void;
  user?: V2SidebarUserData;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}
