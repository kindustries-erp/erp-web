import type { ReactNode } from "react";
import type {
  V2SidebarNavItem,
  V2SidebarSectionData,
  V2BreadcrumbItem,
} from "@/v2/shared/components";
import type { V2UserMenuRenderProp } from "@/v2/shared/components/molecules/v2-sidebar-bottom";
import type { V2BaseProps } from "@/v2/shared/types";
import type { V2AdminBottomNavVariantType } from "@/v2/shared/components/organisms/v2-admin-bottom-nav";
import type { V2NavIndicatorType } from "@/v2/shared/components/molecules/v2-nav-item";

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
  userMenuNode?: V2UserMenuRenderProp;
  notificationNode?: ReactNode;
  currentTheme?: string;
  onThemeChange?: (theme: any) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  bottomNavVariant?: V2AdminBottomNavVariantType;
  bottomNavIndicator?: V2NavIndicatorType;
}
