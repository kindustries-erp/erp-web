import { useQuery } from "@tanstack/react-query";
import api from "@/core/api/axiosInstance";

export interface VinfastPartDashboardTableRow {
  itemCode: string;
  itemName: string;
  vehicleType: string;
  qtyBought: number;
  qtySold: number;
  amountBought: number;
  amountSold: number;
  profit: number;
}

export function useVinfastPartsDashboardTable(
  filterState: any,
  page: number,
  limit: number,
  vehicleType?: string,
) {
  return useQuery({
    queryKey: [
      "vinfast-parts-dashboard-table",
      filterState.dateFrom,
      filterState.dateTo,
      page,
      limit,
      vehicleType,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterState.dateFrom) params.append("dateFrom", filterState.dateFrom);
      if (filterState.dateTo) params.append("dateTo", filterState.dateTo);
      if (vehicleType && vehicleType !== "all")
        params.append("vehicleType", vehicleType);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await api.get(
        `/api/v1/reports/vinfast-parts-dashboard-table?${params.toString()}`,
      );
      return res.data as {
        items: VinfastPartDashboardTableRow[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    },
  });
}
