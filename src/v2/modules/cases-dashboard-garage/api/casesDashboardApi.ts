import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { V2PaginatedResponse } from "@/v2/shared/types/v2-pagination";
import type {
  CasesDashboardCaseItem,
  CasesDashboardCasesParams,
  CasesDashboardFunnel,
  CasesDashboardPeriodKpis,
  CasesDashboardRangeParams,
} from "../domain/casesDashboard.type";

const BASE = "/api/v2/cases-dashboard-garage";

/** Bỏ các khóa rỗng để query string gọn và backend dùng giá trị mặc định. */
function compactParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  ) as Partial<T>;
}

export const casesDashboardApi = {
  /** KPI tháng/tuần/ngày và dự thu, quanh ngày gốc (mặc định hôm nay phía backend). */
  getPeriodKpis: async (date?: string): Promise<CasesDashboardPeriodKpis> => {
    const { data } = await v2HttpClient.get<CasesDashboardPeriodKpis>(
      `${BASE}/period-kpis`,
      { params: compactParams({ date }) },
    );
    return data;
  },

  /** Phễu giai đoạn theo khoảng ngày (mặc định tháng hiện tại phía backend). */
  getFunnel: async (
    params?: CasesDashboardRangeParams,
  ): Promise<CasesDashboardFunnel> => {
    const { data } = await v2HttpClient.get<CasesDashboardFunnel>(
      `${BASE}/funnel`,
      { params: compactParams(params ?? {}) },
    );
    return data;
  },

  /** Danh sách lệnh (drill-down) có phân trang. */
  listCases: async (
    params?: CasesDashboardCasesParams,
  ): Promise<V2PaginatedResponse<CasesDashboardCaseItem>> => {
    const { data } = await v2HttpClient.get<
      V2PaginatedResponse<CasesDashboardCaseItem>
    >(`${BASE}/cases`, { params: compactParams(params ?? {}) });
    return data;
  },
};
