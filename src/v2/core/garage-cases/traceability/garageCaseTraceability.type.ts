import type {
  TraceabilityGraphData,
  TranslateFn,
} from "@/v2/shared/components/organisms/v2-document-traceability";

/** Thông tin phiếu dịch vụ cần để dựng node gốc của sơ đồ */
export interface GarageCaseTraceabilityCase {
  id: string;
  soChungTu?: string | null;
  bienSoXe?: string | null;
  ngayPhatSinh?: string | Date | null;
  tienCoThue?: number | string | null;
  doanhThu?: number | string | null;
  rawData?: { TongTienThanhToan?: number | string | null } | null;
  tenTinhTrangDichVu?: string | null;
  tinhTrangDichVu?: number | null;
  khachHangName?: string | null;
}

/** Khoản thu/chi gắn với phiếu (API trả lẫn camelCase và snake_case) */
export interface GarageCaseSettlement {
  id?: string;
  tempId?: string;
  amount?: number | string | null;
  category?: string | null;
  note?: string | null;
  settlement_type?: string;
  settlementType?: string;
  source_channel?: string;
  sourceChannel?: string;
  bank_transaction_id?: string | null;
  bankTransactionId?: string | null;
  referenceNumber?: string | null;
  reference_number?: string | null;
  bankName?: string | null;
  trans_date?: string | null;
  transDate?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  partner_name?: string | null;
  partnerName?: string | null;
  correspondentName?: string | null;
}

/** Hóa đơn gắn với phiếu (dạng phẳng hoặc lồng trong `invoice`) */
export interface GarageCaseLinkedInvoice {
  id?: string;
  invoiceId?: string;
  linkType?: string;
  direction?: string;
  invoiceNo?: string | null;
  serialNo?: string | null;
  totalAmount?: number | string | null;
  invoiceDate?: string | null;
  createdAt?: string | null;
  status?: string | null;
  partnerName?: string | null;
  sellerName?: string | null;
  buyerName?: string | null;
  invoice?: {
    id?: string;
    invoiceNo?: string | null;
    serialNo?: string | null;
    totalAmount?: number | string | null;
    invoiceDate?: string | null;
    status?: string | null;
    sellerName?: string | null;
    buyerName?: string | null;
  } | null;
}

export interface BuildGarageCaseTraceabilityInput {
  caseInfo: GarageCaseTraceabilityCase;
  /** Đồ thị backend; null khi chưa tải */
  serverGraph: TraceabilityGraphData | null;
  /** Khoản thu/chi đang hiệu lực (đã trừ khoản bị gỡ khi sửa, đã cộng khoản mới) */
  settlements: GarageCaseSettlement[];
  /** Hóa đơn đang hiệu lực */
  linkedInvoices: GarageCaseLinkedInvoice[];
  t: TranslateFn;
  /** 1 = chỉ liên kết trực tiếp; bỏ trống = giữ mọi chặng backend trả về */
  maxDepth?: number;
}

export type GarageAddLinkAction =
  | "ADD_INVOICE"
  | "ADD_SETTLEMENT"
  | "PO_UNSUPPORTED"
  | "SO_UNSUPPORTED";

export type GarageUnlinkTarget =
  | { kind: "INVOICE"; id: string }
  | { kind: "SETTLEMENT"; id: string };
