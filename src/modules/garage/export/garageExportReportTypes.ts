/** Lựa chọn trong ô "Loại báo cáo" của drawer xuất Excel Garage (multi-select). */
export const GARAGE_EXPORT_REPORT_TYPES = [
  "cases-list",
  "period-overview",
  "period-pnl",
  "period-receivables",
  "period-payables",
  "period-overdue",
  "period-cashflow",
] as const;
export type GarageExportReportType =
  (typeof GARAGE_EXPORT_REPORT_TYPES)[number];

/** Giá trị đặt sẵn khi mở từ tab Tổng quan: chọn đủ mọi mục báo cáo kỳ. */
export type GarageExportDefaultReport = GarageExportReportType | "period-all";

/** Mục báo cáo kỳ gửi lên API (khớp `GaragePeriodReportSectionKey` ở erp-api). */
export type GaragePeriodReportSectionKey =
  | "overview"
  | "pnl"
  | "receivables"
  | "payables"
  | "overdue"
  | "cashflow";

type PeriodReportType = Exclude<GarageExportReportType, "cases-list">;

const PERIOD_SECTION_KEY: Record<
  PeriodReportType,
  GaragePeriodReportSectionKey
> = {
  "period-overview": "overview",
  "period-pnl": "pnl",
  "period-receivables": "receivables",
  "period-payables": "payables",
  "period-overdue": "overdue",
  "period-cashflow": "cashflow",
};

/** Khoá i18n (`exportReport.types.*`) của từng lựa chọn. */
export const GARAGE_EXPORT_REPORT_TYPE_KEY: Record<
  GarageExportReportType,
  string
> = {
  "cases-list": "casesList",
  "period-overview": "periodOverview",
  "period-pnl": "periodPnl",
  "period-receivables": "periodReceivables",
  "period-payables": "periodPayables",
  "period-overdue": "periodOverdue",
  "period-cashflow": "periodCashflow",
};

/** Mọi mục báo cáo kỳ (lựa chọn mặc định của tab Tổng quan). */
const ALL_PERIOD_TYPES = GARAGE_EXPORT_REPORT_TYPES.filter(
  (type): type is PeriodReportType => type !== "cases-list",
);

export function isCasesReport(type: GarageExportReportType): boolean {
  return type === "cases-list";
}

/** Danh sách lựa chọn đặt sẵn khi mở drawer. */
export function defaultReportSelection(
  value: GarageExportDefaultReport,
): GarageExportReportType[] {
  return value === "period-all" ? [...ALL_PERIOD_TYPES] : [value];
}

/**
 * Cập nhật lựa chọn sau một lần chọn trong combobox: bảng kê phiếu dịch vụ loại trừ các mục
 * kỳ, và không cho phép để trống (giữ lựa chọn cũ).
 */
export function applyReportSelection(
  prev: GarageExportReportType[],
  next: GarageExportReportType[],
): GarageExportReportType[] {
  const added = next.find((type) => !prev.includes(type));
  if (added === "cases-list") return ["cases-list"];
  if (added) return next.filter((type) => !isCasesReport(type));
  return next.length > 0 ? next : prev;
}

/** Mục báo cáo kỳ gửi lên API; rỗng khi chỉ chọn bảng kê phiếu dịch vụ. */
export function toPeriodSectionKeys(
  types: GarageExportReportType[],
): GaragePeriodReportSectionKey[] {
  return types
    .filter((type): type is PeriodReportType => !isCasesReport(type))
    .map((type) => PERIOD_SECTION_KEY[type]);
}
