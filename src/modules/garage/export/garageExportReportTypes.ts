/** Loại báo cáo trong drawer xuất Excel dùng chung của Garage. */
export const GARAGE_EXPORT_REPORT_TYPES = [
  "cases-list",
  "period-all",
  "period-business",
  "period-cashflow-debts",
  "period-overdue",
] as const;
export type GarageExportReportType =
  (typeof GARAGE_EXPORT_REPORT_TYPES)[number];

/** `reportType` của API báo cáo kỳ (khớp `GaragePeriodReportType` ở erp-api). */
export type GaragePeriodReportType =
  | "all"
  | "business"
  | "cashflow-debts"
  | "overdue";

const PERIOD_REPORT_TYPE: Record<
  Exclude<GarageExportReportType, "cases-list">,
  GaragePeriodReportType
> = {
  "period-all": "all",
  "period-business": "business",
  "period-cashflow-debts": "cashflow-debts",
  "period-overdue": "overdue",
};

/** Khoá i18n (`exportReport.types.*`) của từng loại báo cáo. */
export const GARAGE_EXPORT_REPORT_TYPE_KEY: Record<
  GarageExportReportType,
  string
> = {
  "cases-list": "casesList",
  "period-all": "periodAll",
  "period-business": "periodBusiness",
  "period-cashflow-debts": "periodCashflowDebts",
  "period-overdue": "periodOverdue",
};

export function isCasesReport(type: GarageExportReportType): boolean {
  return type === "cases-list";
}

/** Loại báo cáo kỳ gửi lên API; `undefined` với bảng kê phiếu dịch vụ. */
export function toPeriodReportType(
  type: GarageExportReportType,
): GaragePeriodReportType | undefined {
  return type === "cases-list" ? undefined : PERIOD_REPORT_TYPE[type];
}
