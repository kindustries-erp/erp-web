import type { LucideIcon } from "lucide-react";
import { V2AdminRouteId } from "@/v2/shared/types";
import {
  type V2NavIndicator,
  type V2NavIndicatorType,
} from "@/v2/shared/components/molecules/v2-nav-item";

export enum V2AdminBottomNavVariant {
  GROUNDED = "grounded",
  FLOATING = "floating",
}

export type V2AdminBottomNavVariantType =
  | V2AdminBottomNavVariant
  | `${V2AdminBottomNavVariant}`;

export interface V2AdminNavItemDef {
  id: V2AdminRouteId | string;
  label: string;
  icon: LucideIcon;
  href: string;
}

export interface V2AdminBottomNavProps {
  activeId?: V2AdminRouteId | string;
  items?: V2AdminNavItemDef[];
  variant?: V2AdminBottomNavVariantType;
  indicator?: V2NavIndicator | V2NavIndicatorType;
  onNavigate?: (item: V2AdminNavItemDef) => void;
  className?: string;
}
