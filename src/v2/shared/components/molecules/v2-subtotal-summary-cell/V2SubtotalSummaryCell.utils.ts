import { formatAmount, formatNumber } from "@/v2/shared/utils/v2TableFormat";
import type { V2SubtotalVariant } from "./V2SubtotalSummaryCell.type";

const clampPct = (raw: number): number => Math.min(100, Math.max(0, raw));

/** Tỷ lệ phần trăm (1 chữ số thập phân) của `value` trên `total`, luôn trong [0, 100] */
export const ratioPct = (value: number, total: number): number => {
  if (!total) return 0;
  return clampPct(Math.round((Math.abs(value) / Math.abs(total)) * 1000) / 10);
};

/** Lũy kế đến trang hiện tại: ưu tiên giá trị truyền vào, ở trang 1 thì bằng trang hiện tại */
export const resolveCumulative = (
  page: number,
  pageValue: number,
  cumulativeValue?: number,
): number | undefined => {
  if (cumulativeValue !== undefined) return cumulativeValue;
  return page <= 1 ? pageValue : undefined;
};

export const isMultiPage = (totalPages: number): boolean => totalPages > 1;

export const formatSubtotalValue = (
  variant: V2SubtotalVariant,
  value: number,
  unit?: string,
  locale?: string,
): string => {
  if (variant === "amount") return formatAmount(value, locale);
  const formatted = formatNumber(value, locale);
  return unit ? `${formatted} ${unit}` : formatted;
};
