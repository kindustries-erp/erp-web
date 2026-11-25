const pad = (n: number) => String(n).padStart(2, "0");

/** Date → `yyyy-MM-ddTHH:mm` theo giờ máy. */
export const toLocalDateTime = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** Tách `yyyy-MM-ddTHH:mm` thành ngày (`yyyy-MM-dd`) và giờ (`HH:mm`); rỗng thì cả hai rỗng. */
export function splitDateTime(value: string): { date: string; time: string } {
  const m = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/.exec(value ?? "");
  return { date: m?.[1] ?? "", time: m?.[2] ?? "" };
}

/** Ghép ngày và giờ; thiếu ngày trả rỗng, thiếu giờ thì lấy `fallbackTime`. */
export function joinDateTime(
  date: string,
  time: string,
  fallbackTime: string,
): string {
  if (!date) return "";
  return `${date}T${time || fallbackTime}`;
}

/** Thời điểm cách hiện tại `minutes` phút về trước, dạng `yyyy-MM-ddTHH:mm`. */
export const minutesBefore = (minutes: number, now: Date = new Date()) =>
  toLocalDateTime(new Date(now.getTime() - minutes * 60_000));
