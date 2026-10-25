export type V2ExportPeriodType = "month" | "quarter" | "custom";

export interface V2ExportPeriodOption {
  value: string;
  label: string;
}

/** Nhãn tùy biến (đã dịch) cho một mốc thời gian, mặc định giữ nguyên tiếng Việt */
export type V2PeriodLabelFormatter = (
  /** Số thứ tự kỳ: tháng 1–12 hoặc quý 1–4 */
  index: number,
  year: number,
  /** Ngày đầu và cuối kỳ dạng `yyyy-MM-dd` */
  from: string,
  to: string,
) => string;

/** Ngày đầu quý, dạng `yyyy-MM-dd`. Quý dạng `yyyy-Qn`, trả "" nếu sai định dạng */
export function quarterFirstDay(quarter: string): string {
  if (!quarter || !quarter.includes("-Q")) return "";
  const [year, qNum] = quarter.split("-Q");
  const startMonth = (parseInt(qNum, 10) - 1) * 3 + 1;
  return `${year}-${String(startMonth).padStart(2, "0")}-01`;
}

/** Ngày cuối quý, dạng `yyyy-MM-dd` */
export function quarterLastDay(quarter: string): string {
  if (!quarter || !quarter.includes("-Q")) return "";
  const [year, qNum] = quarter.split("-Q");
  const endMonth = parseInt(qNum, 10) * 3;
  const lastDay = new Date(Number(year), endMonth, 0).getDate();
  return `${year}-${String(endMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

/** Quý hiện tại dạng `yyyy-Qn` */
export function initQuarter(now: Date = new Date()): string {
  const q = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}-Q${q}`;
}

const defaultQuarterLabel: V2PeriodLabelFormatter = (q, y, from, to) =>
  `Quý ${q}/${y} (${from.slice(8, 10)}/${from.slice(5, 7)} - ${to.slice(8, 10)}/${to.slice(5, 7)}/${y})`;

/** Các quý của năm hiện tại và `yearsBack` năm trước, mới nhất trước */
export function generateQuarterOptions(
  yearsBack = 3,
  now: Date = new Date(),
  formatLabel: V2PeriodLabelFormatter = defaultQuarterLabel,
): V2ExportPeriodOption[] {
  const currentYear = now.getFullYear();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const options: V2ExportPeriodOption[] = [];

  for (let y = currentYear; y >= currentYear - yearsBack; y--) {
    const maxQ = y === currentYear ? currentQuarter : 4;
    for (let q = maxQ; q >= 1; q--) {
      const value = `${y}-Q${q}`;
      options.push({
        value,
        label: formatLabel(q, y, quarterFirstDay(value), quarterLastDay(value)),
      });
    }
  }
  return options;
}

/** Suy ra quý từ khoảng ngày nếu khớp đúng một quý, ngược lại "" */
export function quarterFromExactRange(
  dateFrom?: string,
  dateTo?: string,
): string {
  if (!dateFrom || !dateTo || dateFrom.length < 10 || dateTo.length < 10) {
    return "";
  }
  const year = dateFrom.slice(0, 4);
  if (dateTo.slice(0, 4) !== year) return "";

  for (let q = 1; q <= 4; q++) {
    const key = `${year}-Q${q}`;
    if (dateFrom === quarterFirstDay(key) && dateTo === quarterLastDay(key)) {
      return key;
    }
  }
  return "";
}

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

/** Từ ngày lớn hơn Đến ngày. Thiếu một trong hai ngày thì không coi là sai */
export function isDateRangeInvalid(
  dateFrom?: string,
  dateTo?: string,
): boolean {
  if (!dateFrom || !dateTo) return false;
  return dateFrom > dateTo;
}
