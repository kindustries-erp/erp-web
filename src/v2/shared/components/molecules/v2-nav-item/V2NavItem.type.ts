import type { LucideIcon } from "lucide-react";
import type { V2ButtonBaseProps } from "@/v2/shared/types";

export enum V2NavItemVariant {
  SIDEBAR = "sidebar",
  BOTTOM_NAV = "bottom-nav",
}

export type V2NavItemVariantType = V2NavItemVariant | `${V2NavItemVariant}`;

export enum V2NavIndicator {
  DOT = "dot",
  PILL = "pill",
  SUBTLE = "subtle",
}

export type V2NavIndicatorType = V2NavIndicator | `${V2NavIndicator}`;

export interface V2NavItemProps extends V2ButtonBaseProps {
  label: string;
  icon: LucideIcon;
  href?: string;
  isActive?: boolean;
  badgeCount?: number;
  variant?: V2NavItemVariantType;
  indicator?: V2NavIndicatorType;
  isCollapsed?: boolean;
}
