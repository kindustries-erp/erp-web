import type { LucideIcon } from "lucide-react";

export type V2NavItemVariant = "sidebar" | "bottom-nav";

export interface V2NavItemProps {
  label: string;
  icon: LucideIcon;
  href?: string;
  isActive?: boolean;
  badgeCount?: number;
  variant?: V2NavItemVariant;
  isCollapsed?: boolean;
  onClick?: () => void;
  className?: string;
}
