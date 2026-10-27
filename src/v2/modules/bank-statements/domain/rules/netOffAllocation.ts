/** Làm việc bằng xu để tránh sai số số thực khi cộng nhiều khoản cấn trừ */
const toCents = (value: number): number => Math.round(value * 100);

/** Số tiền mặc định khi chọn hóa đơn: không vượt số còn lại của hóa đơn và số còn có thể cấn trừ */
export function defaultNetOffAmount(
  remaining: number,
  maxAvailable: number,
): number {
  return Math.max(0, Math.min(remaining, maxAvailable));
}

/** Kẹp số tiền nhập tay vào khoảng [0, còn lại của hóa đơn] */
export function clampNetOffAmount(value: number, remaining: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(0, value), Math.max(0, remaining));
}

/** Tổng các khoản cấn trừ có vượt số còn có thể cấn trừ của giao dịch không */
export function exceedsNetOffLimit(
  amounts: number[],
  maxAvailable: number,
): boolean {
  const total = amounts.reduce((sum, a) => sum + toCents(a), 0);
  return total > toCents(maxAvailable);
}

/** Số còn lại của hóa đơn sau các khoản đã cấn trừ, không âm */
export function invoiceRemaining(total: number, netOff: number): number {
  return Math.max(
    0,
    Math.round((Number(total || 0) - Number(netOff || 0)) * 100) / 100,
  );
}
