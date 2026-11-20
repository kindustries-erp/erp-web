import type {
  CasesDashboardCasesParams,
  CasesDashboardRangeParams,
} from "../../domain/casesDashboard.type";

/** Khóa React Query của dashboard garage V2; mọi khóa bắt đầu bằng `cases-dashboard-garage`. */
export const casesDashboardKeys = {
  all: ["cases-dashboard-garage"] as const,
  periodKpis: (date?: string) =>
    [...casesDashboardKeys.all, "period-kpis", date ?? "today"] as const,
  funnel: (params: CasesDashboardRangeParams) =>
    [...casesDashboardKeys.all, "funnel", params] as const,
  cases: (params: CasesDashboardCasesParams) =>
    [...casesDashboardKeys.all, "cases", params] as const,
};
