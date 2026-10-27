import type { TraceabilityNodeType } from "../types/traceability.type";

/** Màu chuẩn: Thu (emerald) và Chi (orange) theo Cashflow Dashboard */
export const RECEIPT_BADGE =
  "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800";
export const RECEIPT_BORDER = "border-l-4 border-l-emerald-500";
export const RECEIPT_AMOUNT =
  "text-emerald-600 dark:text-emerald-400 font-bold";
export const PAYMENT_BADGE =
  "bg-orange-50 text-[#ea580c] border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800";
export const PAYMENT_BORDER = "border-l-4 border-l-[#ea580c]";
export const PAYMENT_AMOUNT = "text-[#ea580c] dark:text-orange-400 font-bold";
export const NEUTRAL_BADGE = "bg-slate-100 text-slate-700 border-slate-200";

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
