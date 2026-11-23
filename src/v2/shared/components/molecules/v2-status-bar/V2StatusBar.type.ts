import type { ReactNode } from "react";
import type { V2BaseProps } from "@/v2/shared/types";
import type { V2BreadcrumbItem } from "../v2-breadcrumb";

export interface V2StatusBarProps extends V2BaseProps<HTMLElement> {
  breadcrumbs?: V2BreadcrumbItem[];
  branchName?: string;
  companyName?: string;
  logoUrl?: string;
  onBranchClick?: () => void;
  statusActions?: ReactNode;
  showEnvIndicator?: boolean;
}
