export type FinancialRowType = "PARENT_TARGET" | "CHILD_ITEM";

export type FinancialIconType =
  | "TARGET_REVENUE"
  | "TARGET_COST"
  | "INVOICE"
  | "CASH"
  | "BANK";

export interface FinancialTreeItem {
  id: string;
  rowType: FinancialRowType;
  direction: "REVENUE" | "COST";

  // Hiển thị tên & biểu tượng
  title: string;
  subTitle?: string;
  iconType: FinancialIconType;

  // Số tiền & tỷ lệ
  targetAmount?: number; // Số tiền mục tiêu (cho PARENT)
  amount: number; // Số tiền của dòng
  settledAmount?: number; // Đã thu / đã chi (cho PARENT)
  remainingAmount?: number; // Còn lại (cho PARENT)
  percentOfTotal: number; // Tỷ lệ % trên tổng mục tiêu (0 -> 100+)

  // Chi tiết cấn trừ (cho CHILD)
  payer?: "KH" | "BH" | "GARAGE" | "VENDOR";
  date?: string;
  partnerName?: string;
  note?: string;
  invoiceNo?: string;
  isPending?: boolean; // Draft chưa lưu DB (Chờ lưu)

  // Nguồn để gỡ/xóa
  sourceId?: string; // ID hóa đơn hoặc settlement để gỡ
  sourceType?: "INVOICE" | "SETTLEMENT";
}
