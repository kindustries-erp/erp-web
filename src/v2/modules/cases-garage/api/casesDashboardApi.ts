import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { V2PaginatedResponse } from "@/v2/shared/types/v2-pagination";
import type {
  CasesDashboardOverview,
  CasesDashboardOverviewParams,
  CasesDashboardVehicleItem,
  CasesDashboardVehiclesParams,
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
  /** KPI tháng/tuần/ngày, dự thu và phễu giai đoạn (mặc định phía backend: hôm nay, tháng hiện tại). */
  getOverview: async (
    params?: CasesDashboardOverviewParams,
  ): Promise<CasesDashboardOverview> => {
    const { data } = await v2HttpClient.get<CasesDashboardOverview>(
      `${BASE}/overview`,
      { params: compactParams(params ?? {}) },
    );
    return data;
  },

  /** Danh sách XE (drill-down) có phân trang; mỗi dòng một xe kèm các lệnh. */
  listVehicles: async (
    params?: CasesDashboardVehiclesParams,
  ): Promise<V2PaginatedResponse<CasesDashboardVehicleItem>> => {
    const { data } = await v2HttpClient.get<
      V2PaginatedResponse<CasesDashboardVehicleItem>
    >(BASE, { params: compactParams(params ?? {}) });
    return data;
  },
};
