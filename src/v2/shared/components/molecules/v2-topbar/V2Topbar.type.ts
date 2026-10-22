import type { ReactNode } from "react";
import type { V2BreadcrumbItem } from "../v2-breadcrumb";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2TopbarProps extends V2BaseProps<HTMLElement> {
  breadcrumbs?: V2BreadcrumbItem[];
  branchName?: string;
  companyName?: string;
  logoUrl?: string;
  onSearchClick?: () => void;
  onBranchClick?: () => void;
  isDark?: boolean;
  onThemeToggle?: () => void;
  actions?: ReactNode;
}
