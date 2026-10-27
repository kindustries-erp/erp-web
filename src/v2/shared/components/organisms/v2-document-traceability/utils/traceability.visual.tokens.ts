import type { TraceabilityNodeType } from "../types/traceability.type";

/** Màu chuẩn: Thu (emerald) và Chi (orange) theo Cashflow Dashboard */
export const RECEIPT_BADGE = "bg-success-bg text-success border-success/30   ";
export const RECEIPT_BORDER = "border-l-4 border-l-success";
export const RECEIPT_AMOUNT = "text-success font-bold";
export const PAYMENT_BADGE = "bg-warning-bg text-warning border-warning/30   ";
export const PAYMENT_BORDER = "border-l-4 border-l-warning";
export const PAYMENT_AMOUNT = "text-warning  font-bold";
export const NEUTRAL_BADGE = "bg-muted text-muted-fg border-border";

export interface TraceabilityVisualMeta {
  /** Mã ngắn hiển thị (HĐ MUA, UNC, GBC...) */
  label: string;
  /** i18n key nhãn phụ */
  subLabelKey?: string;
  /** i18n key tên đầy đủ (dùng cho tooltip và tiêu đề) */
  fullTitleKey: string;
  badgeCls: string;
  cardBorderCls?: string;
  /** i18n key nhãn trạng thái thuế (chỉ hóa đơn) */
  statusLabelKey?: string;
  statusBadgeCls?: string;
  isReceipt?: boolean;
  isPayment?: boolean;
  isInvoiceIn?: boolean;
  isInvoiceOut?: boolean;
  amountCls?: string;
  amountPrefix?: "+" | "-";
}

export interface TraceabilityVisualInput {
  id?: string;
  docType: TraceabilityNodeType;
  docNo?: string;
  title?: string;
  partnerName?: string | null;
  metadata?: Record<string, unknown>;
  sourceChannel?: string;
}
