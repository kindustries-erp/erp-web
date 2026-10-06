import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";

export interface PairedPnlItem {
  key: string;
  categoryKey: string;
  categoryName: string;
  note?: string | null;
  // Month 0 (Kỳ chọn: Tháng T)
  curAmount: number;
  curOjAmount?: number;
  // Month 1 (Kỳ trước: Tháng T-1)
  prevAmount?: number;
  prevOjAmount?: number;
  // Month 2 (Kỳ trước nữa: Tháng T-2)
  prev2Amount?: number;
  prev2OjAmount?: number;
}

export type MultiMonthPnlItem = PairedPnlItem;

export interface PnlFinancialTableProps {
  report?: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoading: boolean;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
  selectedMonth: number;
  selectedYear: number;
  prevMonth: number;
  prevYear: number;
  prev2Month?: number;
  prev2Year?: number;
  isOjOnly?: boolean;
  onOpenDrawer: () => void;
}
