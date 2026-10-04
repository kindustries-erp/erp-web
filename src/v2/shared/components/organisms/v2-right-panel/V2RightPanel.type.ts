import type { ReactNode } from "react";
import type { V2BreadcrumbItem } from "../../molecules/v2-breadcrumb";
import type { V2TabEntry } from "../v2-tab-bar";

export interface V2RightPanelProps {
  breadcrumbs?: V2BreadcrumbItem[];
  branchName?: string;
  companyName?: string;
  onSearchClick?: () => void;
  onBranchClick?: () => void;
  topbarActions?: ReactNode;
  tabs?: V2TabEntry[];
  activeTabId?: string;
  onTabSelect?: (id: string) => void;
  onTabClose?: (id: string) => void;
  children?: ReactNode;
  className?: string;
}
