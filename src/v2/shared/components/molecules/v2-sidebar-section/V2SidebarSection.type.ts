import type { ReactNode } from "react";

export interface V2SidebarSectionProps {
  label?: string;
  isCollapsed?: boolean;
  defaultOpen?: boolean;
  onToggle?: () => void;
  children: ReactNode;
  className?: string;
}
