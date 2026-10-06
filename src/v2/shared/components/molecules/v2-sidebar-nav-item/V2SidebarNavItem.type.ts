import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2SidebarNavItemProps extends V2BaseProps {
  label: string;
  icon?: LucideIcon;
  iconNode?: ReactNode;
  isActive?: boolean;
  isCollapsed?: boolean;
  badgeCount?: number;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
}
