import type { V2SummaryMetric } from "@/v2/shared/types/v2-table";

/** Tab lọc tồn kho, khớp tham số `stockTab` của API */
export const STOCK_TABS = [
  "ALL",
  "IN_STOCK",
  "OUT_OF_STOCK",
  "NEGATIVE",
] as const;
export type StockTab = (typeof STOCK_TABS)[number];

export interface StockBalanceRow {
  id: string;
  branchId: string | null;
  itemCode: string;
  itemName: string;
  unit: string;
  qtyOnHand: number;
  avgCost: number;
  inventoryValue: number;
  /** Nhập cộng dồn toàn thời gian */
  qtyReceived: number;
  /** Xuất cộng dồn toàn thời gian */
  qtyIssued: number;
  /** Điều chỉnh cộng dồn, có dấu */
  qtyAdjusted: number;
  updatedAt: string;
}

export interface StockBalanceListResult {
  items: StockBalanceRow[];
  total: number;
  /** Tổng toàn bộ và subtotal trang theo từng chỉ số, cùng shape với chứng từ */
  summaries?: Record<string, V2SummaryMetric | null>;
  extraData?: {
    /** Số mã theo từng tab, bỏ qua lọc tab */
    tabCounts: Record<string, number>;
  };
}

/** Một dòng thẻ kho của một mã hàng */
export interface StockTransactionRow {
  id: string;
  transactionDate: string;
  /** RECEIPT, ISSUE, ADJUSTMENT, kèm _CANCEL khi là bút toán đảo */
  transactionType: string;
  documentType: string;
  documentId: string;
  qtyIn: number;
  qtyOut: number;
  unitCost: number;
}

export interface StockTransactionListResult {
  items: StockTransactionRow[];
  total: number;
}
