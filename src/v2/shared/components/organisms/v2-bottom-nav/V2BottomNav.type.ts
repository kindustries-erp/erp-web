import type { LucideIcon } from "lucide-react";
import type { V2BaseProps } from "@/v2/shared/types";
import {
  type V2NavIndicator,
  type V2NavIndicatorType,
} from "@/v2/shared/components/molecules/v2-nav-item";

export enum V2BottomNavVariant {
  GROUNDED = "grounded",
  FLOATING = "floating",
  HERO_CENTER = "hero-center",
}

export type V2BottomNavVariantType =
  | V2BottomNavVariant
  | `${V2BottomNavVariant}`;

export interface V2BottomNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badgeCount?: number;
}

export interface V2BottomNavProps extends V2BaseProps<HTMLElement> {
  items: V2BottomNavItem[];
  activeId?: string;
  variant?: V2BottomNavVariantType;
  indicator?: V2NavIndicatorType;
  centerHeroItem?: V2BottomNavItem;
  onNavigate?: (item: V2BottomNavItem) => void;
  onHeroClick?: (item: V2BottomNavItem) => void;
}
