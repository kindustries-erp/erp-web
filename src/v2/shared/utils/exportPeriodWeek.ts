import type {
  V2ExportPeriodOption,
  V2PeriodLabelFormatter,
} from "./exportPeriod";

const pad2 = (n: number) => String(n).padStart(2, "0");
const toIsoDay = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const addLocalDays = (d: Date, days: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const parseIsoDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Khóa tuần ISO của ngày `date` dạng `yyyy-Wnn` (năm ISO có thể khác năm dương lịch) */
export function weekValue(date: Date): string {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${pad2(week)}`;
}

/** Tuần ISO hiện tại dạng `yyyy-Wnn` */
export function initWeek(now: Date = new Date()): string {
  return weekValue(now);
}

/** Thứ Hai đầu tuần dạng `yyyy-MM-dd`, "" nếu sai định dạng */
export function weekFirstDay(week: string): string {
  const match = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!match) return "";
  const weekNum = Number(match[2]);
  if (weekNum < 1 || weekNum > 53) return "";
  // Ngày 4/1 luôn thuộc tuần 1; lùi về thứ Hai của tuần đó
  const jan4 = new Date(Number(match[1]), 0, 4);
  const mondayOfWeek1 = addLocalDays(jan4, -((jan4.getDay() || 7) - 1));
  return toIsoDay(addLocalDays(mondayOfWeek1, (weekNum - 1) * 7));
}

/** Chủ nhật cuối tuần dạng `yyyy-MM-dd`, "" nếu sai định dạng */
export function weekLastDay(week: string): string {
  const first = weekFirstDay(week);
  return first ? toIsoDay(addLocalDays(parseIsoDay(first), 6)) : "";
}

/** Suy ra tuần từ khoảng ngày nếu khớp đúng một tuần (thứ Hai – Chủ nhật), ngược lại "" */
export function weekFromExactRange(dateFrom?: string, dateTo?: string): string {
  if (!dateFrom || !dateTo || dateFrom.length < 10 || dateTo.length < 10) {
    return "";
  }
  const week = weekValue(parseIsoDay(dateFrom));
  return dateFrom === weekFirstDay(week) && dateTo === weekLastDay(week)
    ? week
    : "";
}

const defaultWeekLabel: V2PeriodLabelFormatter = (w, y, from, to) =>
  `Tuần ${w}/${y} (${from.slice(8, 10)}/${from.slice(5, 7)} - ${to.slice(8, 10)}/${to.slice(5, 7)})`;

/** `count` tuần gần nhất, tính từ tuần của `now`, mới nhất trước */
export function generateWeekOptions(
  count = 12,
  now: Date = new Date(),
  formatLabel: V2PeriodLabelFormatter = defaultWeekLabel,
): V2ExportPeriodOption[] {
  return Array.from({ length: count }, (_, i) => {
    const value = weekValue(addLocalDays(now, -7 * i));
    const [year, week] = value.split("-W");
    return {
      value,
      label: formatLabel(
        Number(week),
        Number(year),
        weekFirstDay(value),
        weekLastDay(value),
      ),
    };
  });
}
