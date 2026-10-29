/**
 * Số ngày mỗi cửa sổ quét GDT. Phải khớp với mặc định `GDT_QUERY_WINDOW_DAYS` phía API
 * (`invoice-portal.service.ts`). Chỉ dùng để ước tính số lượt hiển thị trên UI.
 */
export const GDT_QUERY_WINDOW_DAYS = 9;

const DAY_MS = 24 * 60 * 60 * 1000;

function isoToDayNumber(iso: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return (
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / DAY_MS
  );
}

/** Số ngày trong khoảng [from, to] (hai đầu bao gồm). Trả về 0 nếu ngày không hợp lệ hoặc from sau to. */
export function countInclusiveDays(from: string, to: string): number {
  const start = isoToDayNumber(from);
  const end = isoToDayNumber(to);
  if (start === null || end === null || end < start) return 0;
  return end - start + 1;
}

/** Ước tính số lượt quét GDT: chia khoảng ngày theo cửa sổ, làm tròn lên. */
export function estimateWindowCount(
  from: string,
  to: string,
  windowDays: number = GDT_QUERY_WINDOW_DAYS,
): number {
  const days = countInclusiveDays(from, to);
  return days > 0 ? Math.ceil(days / windowDays) : 0;
}
