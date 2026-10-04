import type { ReactNode } from "react";

export interface V2BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface V2BreadcrumbProps {
  items: V2BreadcrumbItem[];
  separator?: ReactNode;
  className?: string;
}
