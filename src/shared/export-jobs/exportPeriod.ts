/** Đơn vị kỳ báo cáo cho drawer xuất Excel. */
export type ExportPeriodUnit = "week" | "month" | "quarter" | "custom";

export interface PeriodRange {
  from: string;
  to: string;
}

export interface PeriodOption {
  value: string;
  label: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** `YYYY-MM-DD` theo giờ địa phương (tránh lệch ngày do múi giờ của toISOString). */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const dayMonth = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

// ── Tuần ISO 8601 (thứ Hai - Chủ nhật) ─────────────────────────────────────

/** Khóa tuần ISO dạng `YYYY-Www` (năm ISO có thể khác năm dương lịch). */
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
  return `${d.getUTCFullYear()}-W${pad(week)}`;
}

export function weekRange(value: string): PeriodRange | null {
  const match = /^(\d{4})-W(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  if (week < 1 || week > 53) return null;

  // Ngày 4/1 luôn thuộc tuần 1; lùi về thứ Hai của tuần đó.
  const jan4 = new Date(year, 0, 4);
  const mondayOfWeek1 = addDays(jan4, -((jan4.getDay() || 7) - 1));
  const monday = addDays(mondayOfWeek1, (week - 1) * 7);
  return { from: toIsoDate(monday), to: toIsoDate(addDays(monday, 6)) };
}

// ── Tháng / Quý ────────────────────────────────────────────────────────────

export function monthValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function monthRange(value: string): PeriodRange | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return {
    from: toIsoDate(new Date(year, month - 1, 1)),
    to: toIsoDate(new Date(year, month, 0)),
  };
}

export function quarterValue(date: Date): string {
  return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
}

export function quarterRange(value: string): PeriodRange | null {
  const match = /^(\d{4})-Q([1-4])$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const quarter = Number(match[2]);
  return {
    from: toIsoDate(new Date(year, (quarter - 1) * 3, 1)),
    to: toIsoDate(new Date(year, quarter * 3, 0)),
  };
}

/** Khoảng ngày của một kỳ; `custom` không có khoảng cố định. */
export function periodRange(
  unit: ExportPeriodUnit,
  value: string,
): PeriodRange | null {
  if (unit === "week") return weekRange(value);
  if (unit === "month") return monthRange(value);
  if (unit === "quarter") return quarterRange(value);
  return null;
}

/** Kỳ chứa ngày `today` theo đơn vị (giá trị mặc định khi chuyển tab). */
export function defaultPeriodValue(
  unit: ExportPeriodUnit,
  today: Date = new Date(),
): string {
  if (unit === "week") return weekValue(today);
  if (unit === "month") return monthValue(today);
  if (unit === "quarter") return quarterValue(today);
  return "";
}

// ── Danh sách lựa chọn (mới nhất trước) ────────────────────────────────────

/** `count` tuần gần nhất, nhãn "Tuần 42/2026 (12/10 - 18/10)". */
export function buildWeekOptions(
  count = 12,
  today: Date = new Date(),
): PeriodOption[] {
  const options: PeriodOption[] = [];
  const seen = new Set<string>();
  for (let i = 0; options.length < count && i < count * 2; i++) {
    const value = weekValue(addDays(today, -7 * i));
    if (seen.has(value)) continue;
    seen.add(value);
    const range = weekRange(value) as PeriodRange;
    const [year, week] = value.split("-W");
    options.push({
      value,
      label: `Tuần ${week}/${year} (${dayMonth(range.from)} - ${dayMonth(range.to)})`,
    });
  }
  return options;
}

export function buildMonthOptions(
  count = 24,
  today: Date = new Date(),
): PeriodOption[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return {
      value: monthValue(d),
      label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`,
    };
  });
}

/** Các quý từ quý hiện tại lùi `yearsBack` năm. */
export function buildQuarterOptions(
  yearsBack = 3,
  today: Date = new Date(),
): PeriodOption[] {
  const currentYear = today.getFullYear();
  const currentQuarter = Math.floor(today.getMonth() / 3) + 1;
  const options: PeriodOption[] = [];
  for (let y = currentYear; y >= currentYear - yearsBack; y--) {
    for (let q = y === currentYear ? currentQuarter : 4; q >= 1; q--) {
      const value = `${y}-Q${q}`;
      const range = quarterRange(value) as PeriodRange;
      options.push({
        value,
        label: `Quý ${q}/${y} (${dayMonth(range.from)} - ${dayMonth(range.to)})`,
      });
    }
  }
  return options;
}

export function buildPeriodOptions(
  unit: ExportPeriodUnit,
  today: Date = new Date(),
): PeriodOption[] {
  if (unit === "week") return buildWeekOptions(12, today);
  if (unit === "month") return buildMonthOptions(24, today);
  if (unit === "quarter") return buildQuarterOptions(3, today);
  return [];
}

/**
 * Nhận diện khoảng ngày có khớp đúng một tuần/tháng/quý hay không (ưu tiên tháng,
 * quý, tuần); dùng để đồng bộ tab kỳ khi người dùng chỉnh ngày tay.
 */
export function detectPeriod(
  from?: string,
  to?: string,
): { unit: ExportPeriodUnit; value: string } {
  if (from && to && from.length >= 10 && to.length >= 10) {
    const start = new Date(`${from.slice(0, 10)}T00:00:00`);
    if (!Number.isNaN(start.getTime())) {
      const candidates: [ExportPeriodUnit, string][] = [
        ["month", monthValue(start)],
        ["quarter", quarterValue(start)],
        ["week", weekValue(start)],
      ];
      for (const [unit, value] of candidates) {
        const range = periodRange(unit, value);
        if (
          range &&
          range.from === from.slice(0, 10) &&
          range.to === to.slice(0, 10)
        ) {
          return { unit, value };
        }
      }
    }
  }
  return { unit: "custom", value: "" };
}
