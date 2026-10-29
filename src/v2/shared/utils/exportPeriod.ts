export * from "./exportPeriod.types";
export * from "./exportPeriodWeek";
export * from "./exportPeriodQuarter";
export * from "./exportPeriodMonth";
export * from "./exportPeriodYear";

/** Từ ngày lớn hơn Đến ngày. Thiếu một trong hai ngày thì không coi là sai */
export function isDateRangeInvalid(
  dateFrom?: string,
  dateTo?: string,
): boolean {
  if (!dateFrom || !dateTo) return false;
  return dateFrom > dateTo;
}
