import type { TraceabilityNodeType } from "../types/traceability.type";

/** Màu chuẩn: Thu (emerald) và Chi (orange) theo Cashflow Dashboard & Theme Harmonization */
export const RECEIPT_BADGE = "bg-success-bg text-success border-success/30";
export const RECEIPT_BORDER =
  "border border-success/30 border-l-[3px] border-l-success hover:border-success/60";
export const RECEIPT_AMOUNT = "text-success font-bold";
export const PAYMENT_BADGE = "bg-warning-bg text-warning border-warning/30";
export const PAYMENT_BORDER =
  "border border-warning/30 border-l-[3px] border-l-warning hover:border-warning/60";
export const PAYMENT_AMOUNT = "text-warning font-bold";
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
  docType?: TraceabilityNodeType;
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
