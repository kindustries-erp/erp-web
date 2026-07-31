import axiosInstance from "@/core/api/axiosInstance";

export const budgetApi = {
  getRecurringItems: async (params: any) => {
    // Actually we will fetch from /api/v1/dashboard-core/cashflow-forecast
    // which has futureProjections. Or better yet, we just use the new endpoint
    const res = await axiosInstance.get(
      "/api/v1/dashboard-core/cashflow-forecast",
      {
        params,
      },
    );
    return res.data;
  },
  getBudgetSuggestions: async (params: any) => {
    const res = await axiosInstance.get(
      "/api/v1/dashboard-core/budget-suggestions",
      {
        params,
      },
    );
    return res.data;
  },
};
