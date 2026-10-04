import type { ReactNode } from "react";
import type {
  V2SidebarNavItem,
  V2SidebarSectionData,
} from "@/v2/shared/components/organisms/v2-sidebar";
import type { V2BreadcrumbItem } from "@/v2/shared/components/molecules/v2-breadcrumb";
import type { V2TabEntry } from "@/v2/shared/components/molecules/v2-tab-bar";
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
}
