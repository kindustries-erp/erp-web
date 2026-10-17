import type { TabItem } from "@/shared/components/PageLayout";

export interface GarageDebtsDashboardTabProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
  onExportClick?: () => void;
  onOpenCustomerDetail?: (
    code: string,
    name?: string,
    licensePlate?: string,
  ) => void;
  canSyncGarage?: boolean;
  onSyncCases?: () => void;
}
