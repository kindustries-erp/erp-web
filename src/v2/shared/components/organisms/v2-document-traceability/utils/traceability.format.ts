import { formatAmount } from "@/v2/shared/utils/v2TableFormat";

const DATE_FORMAT = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

/** Số tiền hiển thị trên thẻ chứng từ (đơn vị đồng) */
export const formatTraceAmount = (value: number): string => formatAmount(value);

/**
 * Ngày chứng từ theo múi giờ GMT+7. Chuỗi không phải ngày hợp lệ trả về "—".
 * Chuỗi chỉ có ngày (YYYY-MM-DD) được coi là đầu ngày GMT+7, không lệch sang hôm trước.
 */
export function formatTraceDate(value?: string | null): string {
  if (!value) return "—";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00+07:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return DATE_FORMAT.format(date);
}
