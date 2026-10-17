import type { TabItem } from "@/shared/components/PageLayout";

export interface GarageCashflowDashboardProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
  onOpenCaseDetail?: (caseCode: string) => void;
  onExportClick?: () => void;
}
