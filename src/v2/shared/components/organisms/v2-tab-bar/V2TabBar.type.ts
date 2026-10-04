import type { LucideIcon } from "lucide-react";

export interface V2TabEntry {
  id: string;
  label: string;
  icon?: LucideIcon;
  isClosable?: boolean;
}

export interface V2TabBarProps {
  tabs: V2TabEntry[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
  onTabClose?: (id: string) => void;
  className?: string;
}
