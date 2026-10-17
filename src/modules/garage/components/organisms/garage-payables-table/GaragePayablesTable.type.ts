import type { GarageDebtsExportContext } from "@/modules/garage/export/garageDebtsExportContext";
import type { TabItem } from "@/shared/components/PageLayout";
import type {
  SupplierDebtItem,
  useGarageSuppliersList,
} from "@/modules/garage/hooks/useGarageSuppliersList";

export interface GaragePayablesTableProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onOpenCustomerDetail?: (customer: {
    code: string;
    name: string;
    licensePlate?: string;
    debtType?: "receivables" | "payables";
  }) => void;
  onOpenSupplierDetail?: (supplier: {
    id: string;
    code: string;
    name: string;
  }) => void;
  onOpenExportDrawer: (context: GarageDebtsExportContext) => void;
  canSyncGarage?: boolean;
  onSyncCases?: () => void;
}

export interface CreateBaseColumnsProps {
  createFilterProps: (columnKey: string, queryPrefix: string) => any;
  getSortState: (key: string) => "asc" | "desc" | "none";
  listHook: ReturnType<typeof useGarageSuppliersList>;
  t: (key: string, fallback: string) => string;
  onOpenCustomerDetail?: (customer: {
    code: string;
    name: string;
    licensePlate?: string;
    debtType?: "receivables" | "payables";
  }) => void;
  onOpenSupplierDetail?: (supplier: {
    id: string;
    code: string;
    name: string;
  }) => void;
}

export type { SupplierDebtItem };
