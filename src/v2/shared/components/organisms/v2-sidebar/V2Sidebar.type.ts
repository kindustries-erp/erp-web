import type { LucideIcon } from "lucide-react";
import type { V2BaseProps } from "@/v2/shared/types";

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

export interface V2SidebarProps extends V2BaseProps<HTMLElement> {
  sections?: V2SidebarSectionData[];
  items?: V2SidebarItem[];
  activeId?: string;
  onNavigate?: (item: V2SidebarItem) => void;
  user?: V2SidebarUserData;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}
