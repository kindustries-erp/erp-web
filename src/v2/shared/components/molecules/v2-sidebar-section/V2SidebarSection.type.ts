import type { ReactNode } from "react";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2SidebarSectionProps extends V2BaseProps {
  label?: string;
  isCollapsed?: boolean;
  defaultOpen?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}
