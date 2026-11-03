/** Loại báo cáo của drawer xuất Excel Garage: chọn một trong hai. */
export const GARAGE_EXPORT_KINDS = ["cases", "period"] as const;
export type GarageExportKind = (typeof GARAGE_EXPORT_KINDS)[number];

/** Nội dung báo cáo kỳ: chọn nhiều mục. */
export const PERIOD_REPORT_TYPES = [
  "period-overview",
  "period-pnl",
  "period-receivables",
  "period-payables",
  "period-overdue",
  "period-cashflow",
] as const;
export type PeriodReportType = (typeof PERIOD_REPORT_TYPES)[number];

/** Mọi lựa chọn báo cáo (bảng kê phiếu dịch vụ + từng mục kỳ). */
export type GarageExportReportType = "cases-list" | PeriodReportType;

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

export function isCasesReport(type: GarageExportReportType): boolean {
  return type === "cases-list";
}

/**
 * Loại và nội dung ban đầu khi mở drawer. Nội dung kỳ luôn có sẵn để khi người dùng
 * đổi sang "Báo cáo theo kỳ" thì lựa chọn trước đó vẫn còn.
 */
export function defaultKindAndPeriods(value: GarageExportDefaultReport): {
  kind: GarageExportKind;
  periodTypes: PeriodReportType[];
} {
  if (value === "cases-list") {
    return { kind: "cases", periodTypes: [...PERIOD_REPORT_TYPES] };
  }
  if (value === "period-all") {
    return { kind: "period", periodTypes: [...PERIOD_REPORT_TYPES] };
  }
  return { kind: "period", periodTypes: [value] };
}

/** Cập nhật nội dung kỳ sau một lần chọn; không cho để trống (giữ lựa chọn cũ). */
export function applyPeriodSelection(
  prev: PeriodReportType[],
  next: PeriodReportType[],
): PeriodReportType[] {
  return next.length > 0 ? next : prev;
}

/** Lựa chọn báo cáo đang áp dụng theo loại. */
export function reportTypesOf(
  kind: GarageExportKind,
  periodTypes: PeriodReportType[],
): GarageExportReportType[] {
  return kind === "cases" ? ["cases-list"] : periodTypes;
}

/** Mục báo cáo kỳ gửi lên API; rỗng khi là bảng kê phiếu dịch vụ. */
export function toPeriodSectionKeys(
  types: GarageExportReportType[],
): GaragePeriodReportSectionKey[] {
  return types
    .filter((type): type is PeriodReportType => !isCasesReport(type))
    .map((type) => PERIOD_SECTION_KEY[type]);
}
