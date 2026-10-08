import type { TabItem } from "@/shared/components/PageLayout";
import type { SupplierDebtItem } from "@/modules/garage/hooks/useGarageSuppliersList";

export interface GaragePayablesTableProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onOpenCustomerDetail?: (customer: { code: string; name: string }) => void;
  onOpenSupplierDetail?: (supplier: {
    id: string;
    code: string;
    name: string;
  }) => void;
  onOpenExportDrawer: () => void;
}

export type { SupplierDebtItem };
