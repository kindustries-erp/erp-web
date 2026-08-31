import { useState, useMemo, useCallback, useEffect } from "react";
import { useT } from "@/core/i18n";
import { useSalesOrdersQuery } from "./useSalesOrdersQuery";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export function useSalesOrdersList() {
  const t = useT();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [customerSearch, setCustomerSearch] = useState("");

  const {
    data: customersData,
    fetchNextPage: fetchNextCustomers,
    isFetchingNextPage: loadingCustomers,
  } = useBasicMasterInfinite({
    search: customerSearch,
    limit: 50,
    entities: "customers",
    enabled: true,
  });

  const customerOptions = useMemo(
    () =>
      customersData?.pages.flatMap((p) =>
        (p.items.customers || []).map((c) => ({ value: c.id, label: c.name })),
      ) || [],
    [customersData],
  );

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: false,
      period: true,
      noDefaultPeriod: true,
      custom: [
        {
          key: "customer_id",
          label: t("Khách hàng"),
          placeholder: t("Tất cả khách hàng"),
          options: customerOptions,
          type: "combobox",
          onSearch: setCustomerSearch,
          onLoadMore: fetchNextCustomers,
          loading: loadingCustomers,
        },
        {
          key: "status",
          label: t("Trạng thái"),
          placeholder: t("Tất cả trạng thái"),
          options: [
            { value: "DRAFT", label: t("Nháp", "Draft") },
            { value: "CONFIRMED", label: t("Đã xác nhận", "Confirmed") },
            { value: "DELIVERED", label: t("Đã giao", "Delivered") },
            {
              value: "PARTIAL_DELIVERED",
              label: t("Giao một phần", "Partially Delivered"),
            },
            { value: "CANCELLED", label: t("Đã hủy", "Cancelled") },
          ],
          type: "select",
        },
      ],
    }),
    [customerOptions, fetchNextCustomers, loadingCustomers, t],
  );

  const filter = useFilterPanel(filterConfig, () => setPage(1));
  const columnState = useTableColumnState("sales-orders-table");

  const activeSort = columnState.sorts[0];
  const sortField = activeSort ? activeSort.replace("-", "") : undefined;
  const sortOrder = activeSort
    ? activeSort.startsWith("-")
      ? "desc"
      : "asc"
    : undefined;

  const {
    data: resData,
    isLoading: loading,
    isFetching,
    refetch: loadOrders,
  } = useSalesOrdersQuery({
    page,
    pageSize,
    status: filter.state.custom["status"] || undefined,
    dateFrom: filter.state.dateFrom || undefined,
    dateTo: filter.state.dateTo || undefined,
    customerId: filter.state.custom["customer_id"] || undefined,
    column_search:
      Object.keys(columnState.columnSearch).length > 0
        ? JSON.stringify(columnState.columnSearch)
        : undefined,
    column_filters:
      Object.keys(columnState.columnFilters).length > 0
        ? JSON.stringify(columnState.columnFilters)
        : undefined,
    sortField,
    sortOrder,
  });

  useEffect(() => {
    setPage(1);
  }, [
    columnState.columnFilters,
    columnState.columnSearch,
    columnState.sorts,
    filter.state.dateFrom,
    filter.state.dateTo,
    filter.state.custom,
  ]);

  const activeFilterCount = useMemo(() => {
    return columnState.activeFilterCount + filter.activeFilterCount;
  }, [columnState.activeFilterCount, filter.activeFilterCount]);

  const clearAllFilters = useCallback(() => {
    columnState.resetFilters();
    columnState.sorts.forEach((s) => {
      const key = s.startsWith("-") ? s.slice(1) : s;
      columnState.setSort(key, "none");
    });
    filter.resetAll();
    setPage(1);
  }, [columnState, filter]);

  return {
    items: resData?.items || [],
    total: resData?.total || 0,
    totalPages: resData?.totalPages || 0,
    loading,
    isFetching,
    page,
    setPage,
    pageSize,
    setPageSize,
    filter,
    filterConfig,
    columnState,
    activeFilterCount,
    clearAllFilters,
    loadOrders,
  };
}
