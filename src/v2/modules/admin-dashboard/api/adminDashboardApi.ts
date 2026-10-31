import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { V2DashboardPeriod } from "@/v2/shared/types";
import type { AdminDashboardSummary } from "../domain/adminDashboard.type";

export interface AdminDashboardQueryParams {
  branchId?: string;
  period?: V2DashboardPeriod | "month" | "quarter" | "year";
}

export const adminDashboardApi = {
  getSummary: async (
    params?: AdminDashboardQueryParams,
  ): Promise<AdminDashboardSummary> => {
    const { data } = await v2HttpClient.get<AdminDashboardSummary>(
      "/api/v2/admin/dashboard/summary",
      { params },
    );
    return data;
  },
};
