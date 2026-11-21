/**
 * Ngày thuần của nhân viên lưu timestamptz. UI làm việc với `yyyy-MM-dd` theo giờ VN (UTC+7)
 * để ngày không lệch khi múi giờ trình duyệt khác (ví dụ 01/05/1990 không thành 30/04/1990).
 */
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** ISO (UTC) sang `yyyy-MM-dd` theo giờ VN; chuỗi rỗng nếu không có hoặc không hợp lệ */
export const isoToVnDate = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return "";
  return new Date(time + VN_OFFSET_MS).toISOString().slice(0, 10);
};

/** `yyyy-MM-dd` (giờ VN) sang ISO UTC lúc 00:00 giờ VN; null nếu rỗng hoặc sai định dạng */
export const vnDateToIso = (date: string): string | null => {
  if (!ISO_DATE.test(date)) return null;
  const time = Date.parse(`${date}T00:00:00+07:00`);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
};

export const todayVnDate = (now: Date = new Date()): string =>
  isoToVnDate(now.toISOString());

/** `yyyy-MM-dd` sang `dd/MM/yyyy` để hiển thị; "—" nếu rỗng */
export const formatVnDate = (iso: string | null | undefined): string => {
  const date = isoToVnDate(iso);
  if (!date) return "—";
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
};
