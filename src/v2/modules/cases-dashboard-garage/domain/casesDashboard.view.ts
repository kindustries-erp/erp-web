import type {
  CasesDashboardClassRowView,
  CasesDashboardFunnelRowView,
  CasesDashboardKpiView,
} from "@/v2/core/garage-cases/dashboard";
import {
  CASES_DASHBOARD_CLASSES,
  CASES_DASHBOARD_FUNNEL_STAGES,
  type CasesDashboardFunnel,
  type CasesDashboardFunnelBucket,
  type CasesDashboardPeriodKpi,
  type CasesDashboardProjected,
} from "./casesDashboard.type";

/** KPI kỳ (có số lệnh và tiền đã thu theo lệnh hoàn thành). */
export function toKpiView(kpi: CasesDashboardPeriodKpi): CasesDashboardKpiView {
  return {
    vehicles: kpi.totalVehicles,
    cases: kpi.totalCases,
    amount: kpi.totalAmountWithTax,
  };
}

/** Dự thu: API không trả số lệnh nên bỏ trống `cases`. */
export function toProjectedKpiView(
  projected: CasesDashboardProjected,
): CasesDashboardKpiView {
  return { vehicles: projected.totalVehicles, amount: projected.totalAmount };
}

/** Các dòng phễu theo thứ tự cố định; bỏ qua giai đoạn không có trong bucket. */
export function toFunnelRows(
  bucket: CasesDashboardFunnelBucket,
): CasesDashboardFunnelRowView[] {
  return CASES_DASHBOARD_FUNNEL_STAGES.map((key) => {
    const stage = bucket.stages[key];
    return {
      key,
      vehicles: stage.vehicles,
      amount: stage.amount,
      rate: stage.rate,
    };
  });
}

/** Bảng phân loại toàn kỳ, lấy từ tổng distinct của từng phân loại. */
export function toClassRows(
  funnel: CasesDashboardFunnel,
): CasesDashboardClassRowView[] {
  return CASES_DASHBOARD_CLASSES.map((key) => {
    const bucket = funnel.byClassification[key];
    return {
      key,
      vehicles: bucket.totalVehicles,
      cases: bucket.totalCases,
      amount: bucket.totalAmount,
    };
  });
}
