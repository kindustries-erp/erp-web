/**
 * Kiểu dữ liệu dashboard garage V2, khớp DTO của `api/v2/cases-dashboard-garage`.
 * Mọi số XE là số biển khác nhau (distinct); số LỆNH và tiền cộng theo lệnh.
 * Tổng các giai đoạn có thể lớn hơn tổng xe vì một xe có thể nằm ở nhiều giai đoạn.
 */

export const CASES_DASHBOARD_STAGES = [
  "intake",
  "quotation",
  "inProgress",
  "completed",
  "cancelled",
] as const;
export type CasesDashboardStage = (typeof CASES_DASHBOARD_STAGES)[number];

export const CASES_DASHBOARD_FUNNEL_STAGES = [
  "quotation",
  "inProgress",
  "completed",
  "cancelled",
] as const;
export type CasesDashboardFunnelStage =
  (typeof CASES_DASHBOARD_FUNNEL_STAGES)[number];

export const CASES_DASHBOARD_CLASSES = [
  "SUA_CHUA_CHUNG",
  "KY_GUI_NOI_BO",
  "OJ_NGOAI",
  "KHAC",
] as const;
export type CasesDashboardClass = (typeof CASES_DASHBOARD_CLASSES)[number];

/** Trạng thái `cases_garage` (enum backend `CaseStatus`). */
export type CasesDashboardCaseStatus =
  | "INTAKE"
  | "QUOTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

/** Số XE, số LỆNH và tiền của một giai đoạn hoặc phân loại. */
export interface CasesDashboardCount {
  vehicles: number;
  cases: number;
  amount: number;
}

/** KPI một kỳ (tháng/tuần/ngày). `totalVehicles` là số xe khác nhau trong kỳ. */
export interface CasesDashboardPeriodKpi {
  totalVehicles: number;
  totalCases: number;
  revenue: number;
  cost: number;
  profit: number;
  totalAmountWithTax: number;
  paidAmount: number;
  outstandingAmount: number;
  collectionRate: number;
  stages: Record<CasesDashboardStage, CasesDashboardCount>;
  classifications: Record<CasesDashboardClass, CasesDashboardCount>;
}

/** Dự thu: xe và tiền của các lệnh đang làm (INTAKE/QUOTED/IN_PROGRESS). */
export interface CasesDashboardProjected {
  totalVehicles: number;
  totalAmount: number;
  classifications: Record<
    CasesDashboardClass,
    { vehicles: number; amount: number }
  >;
}

export interface CasesDashboardPeriodKpis {
  month: CasesDashboardPeriodKpi;
  week: CasesDashboardPeriodKpi;
  day: CasesDashboardPeriodKpi;
  projectedToday: CasesDashboardProjected;
  projectedMonth: CasesDashboardProjected;
}

export interface CasesDashboardFunnelStageValue {
  vehicles: number;
  amount: number;
  /** Tỷ lệ (%) so với tổng xe của nhóm, làm tròn một chữ số thập phân. */
  rate: number;
}

export interface CasesDashboardFunnelBucket {
  totalVehicles: number;
  totalCases: number;
  totalAmount: number;
  stages: Record<CasesDashboardFunnelStage, CasesDashboardFunnelStageValue>;
}

export interface CasesDashboardFunnel {
  /** Tổng toàn kỳ: distinct xe trên cả kỳ, không cộng dồn qua tháng. */
  overall: CasesDashboardFunnelBucket;
  byMonth: Record<string, CasesDashboardFunnelBucket>;
  byClassification: Record<CasesDashboardClass, CasesDashboardFunnelBucket>;
}

/** Một dòng drill-down: một lệnh, kèm khóa xe đã chuẩn hóa. */
export interface CasesDashboardCaseItem {
  id: string;
  caseCode: string;
  licensePlate: string | null;
  vehicleKey: string;
  customerName: string | null;
  status: CasesDashboardCaseStatus;
  stage: CasesDashboardStage;
  classification: CasesDashboardClass;
  receivedAt: string | null;
  completedAt: string | null;
  amount: number;
}

/** Tham số khoảng ngày (YYYY-MM-DD) dùng cho phễu và danh sách lệnh. */
export interface CasesDashboardRangeParams {
  date_from?: string;
  date_to?: string;
}

export interface CasesDashboardCasesParams extends CasesDashboardRangeParams {
  stage?: CasesDashboardStage;
  classification?: CasesDashboardClass;
  page?: number;
  pageSize?: number;
}
