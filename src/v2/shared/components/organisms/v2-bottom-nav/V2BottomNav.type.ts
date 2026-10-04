import type { LucideIcon } from "lucide-react";
import type { V2BaseProps } from "@/v2/shared/types";

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
  onNavigate?: (item: V2BottomNavItem) => void;
}
