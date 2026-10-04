import type { LucideIcon } from "lucide-react";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2TabEntry {
  id: string;
  label: string;
  icon?: LucideIcon;
  isClosable?: boolean;
}

export interface V2TabBarProps extends V2BaseProps<HTMLElement> {
  tabs: V2TabEntry[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
  onTabClose?: (id: string) => void;
}
