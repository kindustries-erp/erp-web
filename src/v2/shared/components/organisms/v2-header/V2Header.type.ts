import type { V2BaseProps } from "@/v2/shared/types";
import type { V2UserMenuRenderProp } from "@/v2/shared/components/molecules/v2-sidebar-bottom";

export interface V2HeaderBreadcrumb {
  label: string;
  href?: string;
}

export interface V2HeaderProps extends V2BaseProps<HTMLElement> {
  title?: string;
  breadcrumbs?: V2HeaderBreadcrumb[];
  userName?: string;
  userRole?: string;
  tenantName?: string;
  branchName?: string;
  logoUrl?: string;
  onBranchClick?: () => void;
  showLanguageSwitcher?: boolean;
  userMenuNode?: V2UserMenuRenderProp;
  notificationNode?: React.ReactNode;
}
