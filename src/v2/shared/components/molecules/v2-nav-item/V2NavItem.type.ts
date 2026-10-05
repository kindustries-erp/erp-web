import type { LucideIcon } from "lucide-react";
import type { V2ButtonBaseProps } from "@/v2/shared/types";

export type V2NavItemVariant = "sidebar" | "bottom-nav";

export interface V2NavItemProps extends V2ButtonBaseProps {
  label: string;
  icon: LucideIcon;
  href?: string;
  isActive?: boolean;
  badgeCount?: number;
  variant?: V2NavItemVariant;
  isCollapsed?: boolean;
}
