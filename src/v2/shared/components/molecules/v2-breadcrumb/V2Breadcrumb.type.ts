import type { ReactNode } from "react";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface V2BreadcrumbProps extends V2BaseProps<HTMLElement> {
  items: V2BreadcrumbItem[];
  separator?: ReactNode;
}
