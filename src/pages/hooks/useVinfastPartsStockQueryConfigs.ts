import api from "@/core/api/axiosInstance";
import { ErpApiEndpoint } from "@/shared/constants/apiEndpoints";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import { getInitialTableState } from "@/shared/hooks/useTableColumnState";

export function getVinfastPartsDashboardQueryConfig() {
  const queryKey = ["vinfast-parts-dashboard", "all", "", "", "month"];
  return {
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("groupBy", "month");
      const res = await api.get(
        `${ErpApiEndpoint.VINFAST_PARTS_DASHBOARD}?${params}`,
      );
      return res.data?.data || res.data;
    },
    staleTime: 60000,
  };
}

export function getVinfastPartsStockQueryConfig(vehicleType: "oto" | "xemay") {
  const tableState = getInitialTableState(`vinfast-parts-stock-${vehicleType}`);
  const activeSort = tableState.sorts?.[0] || "";
  let sortBy = "";
  let sortOrder: "asc" | "desc" = "asc";
  if (activeSort.startsWith("-")) {
    sortBy = activeSort.substring(1);
    sortOrder = "desc";
  } else if (activeSort) {
    sortBy = activeSort;
    sortOrder = "asc";
  }

  const queryKey = [
    "vinfast-parts-stock",
    vehicleType,
    1,
    20,
    sortBy,
    sortOrder,
    tableState.columnSearch || {},
    tableState.columnFilters || {},
    tableState.sorts || [],
  ];

  return {
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append(ErpUrlQueryParam.VEHICLE_TYPE, vehicleType);
      if (sortBy) params.append(ErpUrlQueryParam.SORT_BY, sortBy);
      if (sortOrder) params.append(ErpUrlQueryParam.SORT_DIR, sortOrder);
      if (tableState.sorts && tableState.sorts.length > 0) {
        params.append(ErpUrlQueryParam.SORTS, JSON.stringify(tableState.sorts));
      }
      if (
        tableState.columnSearch &&
        Object.keys(tableState.columnSearch).length > 0
      ) {
        params.append("column_search", JSON.stringify(tableState.columnSearch));
      }
      if (
        tableState.columnFilters &&
        Object.keys(tableState.columnFilters).length > 0
      ) {
        params.append(
          "column_filters",
          JSON.stringify(tableState.columnFilters),
        );
      }
      params.append(ErpUrlQueryParam.PAGE, "1");
      params.append(ErpUrlQueryParam.LIMIT, "20");

      const res = await api.get(
        `${ErpApiEndpoint.VINFAST_PARTS_STOCK}?${params.toString()}`,
      );
      return res.data;
    },
    staleTime: 60000,
  };
}
