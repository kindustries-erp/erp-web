import axiosInstance from "@/core/api/axiosInstance";

export interface DashboardOverviewParams {
  startDate?: string;
  endDate?: string;
  branchId?: string;
}

export const dashboardCoreApi = {
  getOverview: async (params?: DashboardOverviewParams) => {
    const res = await axiosInstance.get("/api/v1/dashboard-core/overview", {
      params,
    });
    return res.data;
  },
  getCashflowForecast: async (params?: DashboardOverviewParams) => {
    const res = await axiosInstance.get(
      "/api/v1/dashboard-core/cashflow-forecast",
      {
        params,
      },
    );
    return res.data;
  },
  getBudgetSuggestions: async (params?: DashboardOverviewParams) => {
    const res = await axiosInstance.get(
      "/api/v1/dashboard-core/budget-suggestions",
      {
        params,
      },
    );
    return res.data;
  },
};
