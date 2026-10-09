import { useQuery } from "@tanstack/react-query";
import { garageCashflowApi } from "../api/garageCashflowApi";

export function useGarageCashflowDashboardStats() {
  return useQuery({
    queryKey: ["garage-cashflow-dashboard-stats"],
    queryFn: async () => {
      return garageCashflowApi.getDashboard();
    },
  });
}
