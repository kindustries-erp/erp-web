import type { LucideIcon } from "lucide-react";
import { V2AdminRouteId } from "@/v2/shared/types";

export interface V2AdminNavItemDef {
  id: V2AdminRouteId | string;
  label: string;
  icon: LucideIcon;
  href: string;
}

export interface V2AdminBottomNavProps {
  activeId?: V2AdminRouteId | string;
  items?: V2AdminNavItemDef[];
  onNavigate?: (item: V2AdminNavItemDef) => void;
  className?: string;
}
