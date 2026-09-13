import { useQuery } from "@tanstack/react-query";
import api from "@/core/api/axiosInstance";

export interface VinfastPartTrackingRow {
  invoiceId: string;
  invoiceNo: string;
  status: string;
  month: string;
  vehicleType: string;
  itemCode: string;
  itemName: string;
  partnerName: string;
  taxCode: string;
  description: string;
  unit: string;
  qtyBought: number;
  qtySold: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  margin: number;
  marginPct: string;
}

export function useVinfastPartsTracking(
  filterState: any,
  page: number,
  limit: number,
  sortsStr: string,
  searchStr: string,
  columnSearchStr: string,
  columnFiltersStr: string,
  vehicleType?: string,
) {
  return useQuery({
    queryKey: [
      "vinfast-parts",
      vehicleType || "all",
      page,
      limit,
      sortsStr,
      searchStr,
      filterState.dateFrom,
      filterState.dateTo,
      columnSearchStr,
      columnFiltersStr,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterState.dateFrom) params.append("dateFrom", filterState.dateFrom);
      if (filterState.dateTo) params.append("dateTo", filterState.dateTo);
      if (searchStr) params.append("search", searchStr);

      const sortsArr = JSON.parse(sortsStr || "[]");
      if (sortsArr.length > 0) params.append("sorts", sortsStr);

      const colSearchObj = JSON.parse(columnSearchStr || "{}");
      if (Object.keys(colSearchObj).length > 0)
        params.append("column_search", columnSearchStr);

      const parsedFilters = JSON.parse(columnFiltersStr || "{}");
      const finalColumnFilters = { ...parsedFilters };
      if (vehicleType) {
        finalColumnFilters["vehicleType"] = [vehicleType];
      }

      if (Object.keys(finalColumnFilters).length > 0)
        params.append("column_filters", JSON.stringify(finalColumnFilters));

      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await api.get(`/api/v1/reports/vinfast-parts?${params}`);

      return {
        data: res.data.data as VinfastPartTrackingRow[],
        total: res.data.total,
        lastPage: Math.ceil(res.data.total / limit),
      };
    },
  });
}
