import type { ReactNode } from "react";
import type {
  V2SidebarNavItem,
  V2SidebarSectionData,
  V2BreadcrumbItem,
} from "@/v2/shared/components";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2AdminLayoutProps extends V2BaseProps {
  children?: ReactNode;
  activeNavId?: string;
  breadcrumbs?: V2BreadcrumbItem[];
  userName?: string;
  userRole?: string;
  tenantName?: string;
  branchName?: string;
  sections?: V2SidebarSectionData[];
  onNavigate?: (item: V2SidebarNavItem) => void;
  onSearchClick?: () => void;
  onBranchClick?: () => void;
  appName?: string;
  logoUrl?: string;
  contentClassName?: string;
  notificationNode?: ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}
