import type { V2BaseProps } from "@/v2/shared/types";

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
  onReturnToV1?: () => void;
}
