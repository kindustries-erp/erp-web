import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/core/api/axiosInstance";
import { createColumnHeaderFilter } from "@/shared/components/DataTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import { ErpApiEndpoint } from "@/shared/constants/apiEndpoints";
import {
  useVinfastPartsStockStore,
  type VehicleStockType,
} from "@/pages/hooks/useVinfastPartsStockStore";
import { useVinfastPartsStockTableUrlSync } from "./useVinfastPartsStockTableUrlSync";

export function useVinfastPartsStockTableLogic(
  vehicleType: VehicleStockType,
  activeTab: string,
) {
  const tabState = useVinfastPartsStockStore((s) => s.states[vehicleType]);
  const setStockTab = useVinfastPartsStockStore((s) => s.setStockTab);
  const setPage = useVinfastPartsStockStore((s) => s.setPage);
  const setPageSize = useVinfastPartsStockStore((s) => s.setPageSize);
  const setSelectedSku = useVinfastPartsStockStore((s) => s.setSelectedSku);

  const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const tableStateOto = useTableColumnState("vinfast-parts-stock-oto");
  const tableStateXemay = useTableColumnState("vinfast-parts-stock-xemay");
  const tableState = vehicleType === "oto" ? tableStateOto : tableStateXemay;

  const activeSort = tableState.sorts[0] || "";
  let sortBy = "";
  let sortOrder = "";
  if (activeSort.startsWith("-")) {
    sortBy = activeSort.substring(1);
    sortOrder = "desc";
  } else if (activeSort) {
    sortBy = activeSort;
    sortOrder = "asc";
  } else {
    sortBy = "qtyBalance";
    sortOrder = "desc";
  }

  useVinfastPartsStockTableUrlSync({
    vehicleType,
    activeTab,
    tabState,
    tableState,
    setSelectedSku,
    setStockTab,
    setPage,
    setPageSize,
  });

  const fetchColumnOptions = useCallback(
    async ({
      columnKey,
      search,
      pageParam,
      filtersStr,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
      filtersStr?: string;
    }) => {
      const parsedFilters = filtersStr ? JSON.parse(filtersStr) : {};
      const res = await api.get(ErpApiEndpoint.VINFAST_PARTS_STOCK_OPTIONS, {
        params: {
          columnKey,
          search,
          page: pageParam,
          limit: 20,
          filters: JSON.stringify(parsedFilters),
          vehicleType: vehicleType === "oto" ? "CAR" : "MOTORBIKE",
          stockTab: tabState.stockTab !== "ALL" ? tabState.stockTab : undefined,
        },
      });
      return {
        items: res.data.items.map((i: any) => ({
          label: i != null ? String(i) : "(Trống)",
          value: i != null ? String(i) : "",
        })),
        total: res.data.total,
        next: res.data.page < res.data.totalPages ? res.data.page + 1 : null,
      };
    },
    [vehicleType, tabState.stockTab],
  );

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        queryKeyPrefix: `vinfast-parts-stock-options-${vehicleType}`,
        fetchOptions: fetchColumnOptions,
      }),
    [tableState, vehicleType, fetchColumnOptions],
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "vinfast-parts-stock",
      vehicleType,
      tabState.stockTab,
      tabState.page,
      tabState.pageSize,
      sortBy,
      sortOrder,
      tableState.columnSearch,
      tableState.columnFilters,
      tableState.sorts,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append(ErpUrlQueryParam.VEHICLE_TYPE, vehicleType);

      if (tabState.stockTab && tabState.stockTab !== "ALL") {
        params.append("stockTab", tabState.stockTab);
        params.append("stock_tab", tabState.stockTab);
      }
      if (sortBy) params.append(ErpUrlQueryParam.SORT_BY, sortBy);
      if (sortOrder) params.append(ErpUrlQueryParam.SORT_DIR, sortOrder);
      if (tableState.sorts.length > 0)
        params.append(ErpUrlQueryParam.SORTS, JSON.stringify(tableState.sorts));
      if (Object.keys(tableState.columnSearch).length > 0)
        params.append("column_search", JSON.stringify(tableState.columnSearch));
      if (Object.keys(tableState.columnFilters).length > 0)
        params.append(
          "column_filters",
          JSON.stringify(tableState.columnFilters),
        );

      params.append(ErpUrlQueryParam.PAGE, tabState.page.toString());
      params.append(ErpUrlQueryParam.LIMIT, tabState.pageSize.toString());

      const res = await api.get(
        `${ErpApiEndpoint.VINFAST_PARTS_STOCK}?${params}`,
      );
      return res.data;
    },
  });

  return {
    tabState,
    tableState,
    setStockTab,
    setPage,
    setPageSize,
    setSelectedSku,
    syncDrawerOpen,
    setSyncDrawerOpen,
    exportOpen,
    setExportOpen,
    headerFilter,
    data,
    isLoading,
    isFetching,
    sortBy,
    sortOrder,
    activeSort,
  };
}
