import type {
  V2ExportPeriodOption,
  V2PeriodLabelFormatter,
} from "./exportPeriod.types";

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
