import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface V2SidebarIconProps {
  icon?: LucideIcon;
  children?: ReactNode;
  isActive?: boolean;
  className?: string;
}
