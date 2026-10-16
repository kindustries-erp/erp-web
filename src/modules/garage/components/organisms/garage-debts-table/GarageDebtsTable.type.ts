import type { GarageDebtsExportContext } from "@/modules/garage/export/garageDebtsExportContext";
import type { TabItem } from "@/shared/components/PageLayout";
import type { CustomerDebtItem } from "@/modules/garage/hooks/useGarageCustomersList";

export interface GarageDebtsTableProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onOpenCustomerDetail: (customer: { code: string; name: string }) => void;
  onOpenExportDrawer: (context: GarageDebtsExportContext) => void;
}

export type { CustomerDebtItem };
