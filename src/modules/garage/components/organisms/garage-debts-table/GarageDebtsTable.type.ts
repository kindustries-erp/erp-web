import type { GarageDebtsExportContext } from "@/modules/garage/export/garageDebtsExportContext";
import type { TabItem } from "@/shared/components/PageLayout";
import type { CustomerDebtItem } from "@/modules/garage/hooks/useGarageCustomersList";

export interface CreateCustomerCashflowParams {
  voucherType: "RECEIPT" | "PAYMENT";
  customerCode?: string;
  partnerName?: string;
  licensePlate?: string;
  amount?: number;
}

export interface GarageDebtsTableProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onOpenCustomerDetail: (customer: {
    code: string;
    name: string;
    licensePlate?: string;
  }) => void;
  onOpenExportDrawer: (context: GarageDebtsExportContext) => void;
  canSyncGarage?: boolean;
  onSyncCases?: () => void;
  onCreateCashflow?: (params: CreateCustomerCashflowParams) => void;
}

export type { CustomerDebtItem };
