import type { V2BaseProps } from "@/v2/shared/types";
import type { V2SidebarItem } from "@/v2/shared/components/organisms/v2-sidebar/V2Sidebar.type";

export interface V2SidebarSubGroupProps extends V2BaseProps<HTMLDivElement> {
  item: V2SidebarItem;
  activeId?: string;
  isCollapsed?: boolean;
  onNavigate?: (item: V2SidebarItem) => void;
}
