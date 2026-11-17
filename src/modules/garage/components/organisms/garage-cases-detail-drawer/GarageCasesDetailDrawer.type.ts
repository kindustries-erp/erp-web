import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";
import type { GarageTimeHorizonKey } from "@/modules/garage/api/garageDebtsAnalyticsApi";

/**
 * Nguồn dữ liệu của drawer chi tiết vụ việc xưởng (dùng chung cho Doanh thu/P&L và Công nợ):
 * - checkpoint: theo khoảng ngày (Doanh thu tháng này, tuần này, hôm nay);
 * - horizon: theo mốc tuổi nợ (quá hạn 31-60, 61-90...);
 * - month: theo một tháng trong xu hướng công nợ.
 */
export type GarageCasesScope =
  | {
      kind: "checkpoint";
      dateFrom: string;
      dateTo: string;
      periodLabel?: string;
      branchId?: string;
    }
  | {
      kind: "horizon";
      horizon: GarageTimeHorizonKey;
      branchId?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  | {
      kind: "month";
      item: GarageTrendItem;
    };

export interface GarageCasesDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  scope: GarageCasesScope | null;
  /** Bật hiển thị 3 cột Doanh thu thuần, Chi phí (Giá vốn), Lợi nhuận gộp (mặc định: true khi checkpoint, false khi debt) */
  showProfitMetrics?: boolean;
  activeTab?: "RECEIPT" | "PAYMENT";
}
