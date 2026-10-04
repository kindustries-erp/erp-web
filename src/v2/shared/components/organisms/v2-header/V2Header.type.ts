export interface V2HeaderBreadcrumb {
  label: string;
  href?: string;
}

export interface V2HeaderProps {
  title?: string;
  breadcrumbs?: V2HeaderBreadcrumb[];
  userName?: string;
  userRole?: string;
  tenantName?: string;
  onReturnToV1?: () => void;
  className?: string;
}
