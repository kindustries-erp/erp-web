import type { ReactNode } from "react";
import type {
  V2SidebarNavItem,
  V2SidebarSectionData,
  V2BreadcrumbItem,
  V2TabEntry,
} from "@/v2/shared/components";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2AppLayoutProps extends V2BaseProps {
  children?: ReactNode;
  activeNavId?: string;
  breadcrumbs?: V2BreadcrumbItem[];
  userName?: string;
  userRole?: string;
  tenantName?: string;
  branchName?: string;
  sections?: V2SidebarSectionData[];
  navItems?: V2SidebarNavItem[];
  tabs?: V2TabEntry[];
  activeTabId?: string;
  onNavigate?: (item: V2SidebarNavItem) => void;
  onTabSelect?: (id: string) => void;
  onTabClose?: (id: string) => void;
  onSearchClick?: () => void;
  onBranchClick?: () => void;
  appName?: string;
  logoUrl?: string;
  contentClassName?: string;
  userMenuNode?: ReactNode;
  notificationNode?: ReactNode;
  onClickLogo?: () => void;
  currentTheme?: string;
  onThemeChange?: (theme: any) => void;
}
