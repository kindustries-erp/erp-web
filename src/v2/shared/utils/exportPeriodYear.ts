import type { V2ExportPeriodOption } from "./exportPeriod.types";

/** Năm hiện tại dạng `yyyy` */
export function initYear(now: Date = new Date()): string {
  return String(now.getFullYear());
}

/** Ngày đầu năm dạng `yyyy-MM-dd`, "" nếu năm rỗng */
export function yearFirstDay(year: string): string {
  if (!year || year.length < 4) return "";
  return `${year.slice(0, 4)}-01-01`;
}

/** Ngày cuối năm dạng `yyyy-MM-dd`, "" nếu năm rỗng */
export function yearLastDay(year: string): string {
  if (!year || year.length < 4) return "";
  return `${year.slice(0, 4)}-12-31`;
}

/** Suy ra năm từ khoảng ngày nếu khớp trọn vẹn từ 01/01 đến 31/12 của cùng một năm, ngược lại "" */
export function yearFromExactRange(dateFrom?: string, dateTo?: string): string {
  if (!dateFrom || !dateTo || dateFrom.length < 10 || dateTo.length < 10) {
    return "";
  }
  const year = dateFrom.slice(0, 4);
  if (dateTo.slice(0, 4) !== year) return "";
  return dateFrom === yearFirstDay(year) && dateTo === yearLastDay(year)
    ? year
    : "";
}

const defaultYearLabel = (y: number) => `Năm ${y}`;

/** Các năm từ năm hiện tại và `yearsBack` năm trước, mới nhất trước */
export function generateYearOptions(
  yearsBack = 4,
  now: Date = new Date(),
  formatLabel: (
    year: number,
    from: string,
    to: string,
  ) => string = defaultYearLabel,
): V2ExportPeriodOption[] {
  const currentYear = now.getFullYear();
  const options: V2ExportPeriodOption[] = [];
  for (let y = currentYear; y >= currentYear - yearsBack; y--) {
    const value = String(y);
    options.push({
      value,
      label: formatLabel(y, yearFirstDay(value), yearLastDay(value)),
    });
  }
  return options;
}
