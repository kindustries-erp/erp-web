import type {
  CasesDashboardOverviewParams,
  CasesDashboardVehiclesParams,
} from "../../domain/casesDashboard.type";

/** Khóa React Query của dashboard garage V2; mọi khóa bắt đầu bằng `cases-dashboard-garage`. */
export const casesDashboardKeys = {
  all: ["cases-dashboard-garage"] as const,
  overview: (params: CasesDashboardOverviewParams = {}) =>
    [...casesDashboardKeys.all, "overview", params] as const,
  vehicles: (params: CasesDashboardVehiclesParams = {}) =>
    [...casesDashboardKeys.all, "vehicles", params] as const,
};
