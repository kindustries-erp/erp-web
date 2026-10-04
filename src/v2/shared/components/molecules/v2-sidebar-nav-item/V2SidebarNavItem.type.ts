import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface V2SidebarNavItemProps {
  label: string;
  icon?: LucideIcon;
  iconNode?: ReactNode;
  isActive?: boolean;
  isCollapsed?: boolean;
  badgeCount?: number;
  onClick?: () => void;
  className?: string;
}
