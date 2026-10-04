import type { V2BaseProps } from "@/v2/shared/types";

export interface V2SidebarHeaderProps extends V2BaseProps {
  appName?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
  onClickLogo?: () => void;
}
