import type { ReactNode } from "react";
import type { V2BreadcrumbItem } from "../v2-breadcrumb";

export interface V2TopbarProps {
  breadcrumbs?: V2BreadcrumbItem[];
  branchName?: string;
  companyName?: string;
  onSearchClick?: () => void;
  onBranchClick?: () => void;
  actions?: ReactNode;
  className?: string;
}
