import type { ReactNode } from "react";
import type { V2BreadcrumbItem } from "../../molecules/v2-breadcrumb";
import type { V2TabEntry } from "../../molecules/v2-tab-bar";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2RightPanelProps extends V2BaseProps<HTMLElement> {
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
}
