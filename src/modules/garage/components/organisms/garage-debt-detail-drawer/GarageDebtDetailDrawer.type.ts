import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";
import type { GarageTimeHorizonKey } from "@/modules/garage/api/garageDebtsAnalyticsApi";

/** Nguồn dữ liệu của drawer công nợ: một tháng trong xu hướng, hoặc một mốc tuổi nợ. */
export type DebtDetailScope =
  | { kind: "month"; item: GarageTrendItem }
  | {
      kind: "horizon";
      horizon: GarageTimeHorizonKey;
      branchId?: string;
      dateFrom?: string;
      dateTo?: string;
    };

export interface GarageDebtDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  scope: DebtDetailScope | null;
  activeTab?: "RECEIPT" | "PAYMENT";
}
