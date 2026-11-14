import type { V2SummaryMetric } from "@/v2/shared/types/v2-table";

/** Trạng thái chứng từ kho */
export const StockVoucherStatus = {
  DRAFT: "DRAFT",
  POSTED: "POSTED",
  CANCELLED: "CANCELLED",
} as const;
export type StockVoucherStatusType =
  (typeof StockVoucherStatus)[keyof typeof StockVoucherStatus];

/** Mã loại chứng từ do module khai báo (ví dụ PURCHASE_RECEIPT, ISSUE); core không biết trước danh sách */
export type StockVoucherTypeCode = string;

/** Một dòng của danh sách chứng từ gộp */
export interface StockVoucherRow {
  id: string;
  type: StockVoucherTypeCode;
  voucherNo: string;
  voucherDate: string;
  status: string;
  partnerName: string | null;
  branchId: string | null;
  totalAmount: number;
  remarks: string | null;
  createdAt: string;
}

/** Dòng hàng của một chứng từ kho khi xem chi tiết */
export interface StockVoucherLine {
  id: string;
  lineNo: number;
  itemCode: string;
  itemName: string;
  unit: string;
  qty: number;
  unitCost: number | null;
  amount: number;
  direction: "IN" | "OUT";
  notes: string | null;
}

/** Chi tiết chứng từ kho (đầu phiếu và các dòng) */
export interface StockVoucherDetail extends Omit<StockVoucherRow, "type"> {
  lines: StockVoucherLine[];
}

export interface StockVoucherListResult {
  items: StockVoucherRow[];
  total: number;
  summaries?: Record<string, V2SummaryMetric | null>;
  /** Số phiếu theo loại, bỏ qua bộ lọc loại (từ `extraData.typeCounts`) */
  typeCounts?: Record<string, number>;
}
