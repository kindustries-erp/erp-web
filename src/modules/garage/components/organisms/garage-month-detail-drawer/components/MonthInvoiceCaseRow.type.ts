import type {
  MonthlyReceivablesGroupItem,
  ReceivablesInvoiceCategory,
  ReceivablesPartnerCategory,
} from "../../../../api/garageDashboardApi";

export interface MonthInvoiceCaseRow {
  /** Unique composite key: `${caseId}_${payerType}` */
  id: string;
  caseId: string;
  soChungTu: string;
  bienSoXe: string;
  khachHangName: string;
  khachHangCode?: string | null;
  tenTinhTrangDichVu?: string;

  /** Thông tin đối tượng hóa đơn / Công ty bảo hiểm từ group cha */
  partnerTitle: string;
  taxCode?: string | null;
  payerType: "KH" | "BH";
  partnerCategory?: ReceivablesPartnerCategory;
  invoiceCategory?: ReceivablesInvoiceCategory;

  /** Trạng thái hóa đơn & VAT */
  hasInvoice: boolean;
  invoiceNo?: string;
  invoiceNos: string[];
  hasVat: boolean;
  vatAmount: number;
  vatWarning: boolean;

  /** Tài chính của phiếu */
  billed: number;
  paid: number;
  remaining: number;
  cost?: number;
  paidCost?: number;
  remainingCost?: number;
  shareRate: number;
  debtType?: "receivables" | "payables";

  /** Tham chiếu đến group cha nếu cần xem chi tiết đối tượng */
  parentGroup?: MonthlyReceivablesGroupItem;
}

export interface MonthInvoiceCasesTotals {
  billed: number;
  paid: number;
  remaining: number;
  caseCount: number;
  vehicleCount: number;
}
