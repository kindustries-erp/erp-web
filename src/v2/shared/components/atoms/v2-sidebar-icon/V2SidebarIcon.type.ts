import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2SidebarIconProps extends V2BaseProps<HTMLSpanElement> {
  icon?: LucideIcon;
  children?: ReactNode;
  isActive?: boolean;
}
