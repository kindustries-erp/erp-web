import type { TraceabilityNodeType } from "../types/traceability.type";

/**
 * Màu chuẩn: Thu (success) và Chi (warning) theo Cashflow Dashboard & Theme Harmonization.
 * Tuân thủ chuẩn V2 Token: không dùng slash opacity trên CSS variables hex (--border, --surface, --approve-fg).
 */
export const RECEIPT_BADGE = "bg-success-bg text-success border-border";
export const RECEIPT_BORDER =
  "border border-border border-l-4 border-l-success hover:border-border";
export const RECEIPT_AMOUNT = "text-success font-semibold";

export const PAYMENT_BADGE = "bg-warning-bg text-warning border-border";
export const PAYMENT_BORDER =
  "border border-border border-l-4 border-l-warning hover:border-warning";
export const PAYMENT_AMOUNT = "text-warning font-semibold";

export const NEUTRAL_BADGE = "bg-muted text-muted-fg border-border";
export const NEUTRAL_BORDER =
  "border border-border border-l-4 border-l-muted-fg/40 hover:border-border";

/** Styling dành cho thẻ đang xem (Active / Current Node) theo chuẩn Dribbble Visual Editor */
export const ACTIVE_NODE_CARD =
  "border-2 border-primary border-l-4 border-l-primary shadow-md ring-2 ring-primary ring-offset-2 ring-offset-surface";
export const ACTIVE_NODE_TAG = "bg-primary text-primary-fg font-bold";

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
