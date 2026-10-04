import type { LucideIcon } from "lucide-react";

export interface V2BottomNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badgeCount?: number;
}

export interface V2BottomNavProps {
  items: V2BottomNavItem[];
  activeId?: string;
  onNavigate?: (item: V2BottomNavItem) => void;
  className?: string;
}
