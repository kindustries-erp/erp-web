import type {
  V2ExportPeriodOption,
  V2PeriodLabelFormatter,
} from "./exportPeriod.types";

/** Tháng hiện tại dạng `yyyy-MM` */
export function initMonth(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Ngày đầu tháng dạng `yyyy-MM-dd`, "" nếu tháng rỗng */
export function monthFirstDay(month: string): string {
  return month ? `${month}-01` : "";
}

/** Ngày cuối tháng dạng `yyyy-MM-dd`, "" nếu tháng rỗng */
export function monthLastDay(month: string): string {
  if (!month) return "";
  const [year, monthNum] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNum, 0).getDate();
  return `${month}-${String(lastDay).padStart(2, "0")}`;
}

/** Suy ra tháng từ khoảng ngày nếu khớp đúng cả tháng, ngược lại "" */
export function monthFromExactRange(
  dateFrom?: string,
  dateTo?: string,
): string {
  if (!dateFrom || !dateTo || dateFrom.length < 10 || dateTo.length < 10) {
    return "";
  }
  const month = dateFrom.slice(0, 7);
  if (dateTo.slice(0, 7) !== month) return "";
  return dateFrom === monthFirstDay(month) && dateTo === monthLastDay(month)
    ? month
    : "";
}

const defaultMonthLabel: V2PeriodLabelFormatter = (m, y) => `Tháng ${m}/${y}`;

/** `count` tháng gần nhất, tính từ tháng của `now`, mới nhất trước */
export function generateMonthOptions(
  count = 24,
  now: Date = new Date(),
  formatLabel: V2PeriodLabelFormatter = defaultMonthLabel,
): V2ExportPeriodOption[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = initMonth(date);
    const monthNum = date.getMonth() + 1;
    return {
      value: month,
      label: formatLabel(
        monthNum,
        date.getFullYear(),
        monthFirstDay(month),
        monthLastDay(month),
      ),
    };
  });
}
