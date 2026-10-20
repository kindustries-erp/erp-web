import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { garageApi } from "../api/garageApi";
import { useGarageStore } from "../store/garageStore";

export function useGarageCaseServicesList() {
  const { selectedBranchId } = useGarageStore();
  const tableState = useTableColumnState("garage-case-services-table");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("ALL");
  const [dateRanges, setDateRanges] = useState<
    Record<string, { from: string; to: string }>
  >({});

  const setDateRange = useCallback(
    (key: string, from?: string, to?: string) => {
      setDateRanges((prev) => ({
        ...prev,
        [key]: { from: from || "", to: to || "" },
      }));
      setPage(1);
    },
    [],
  );

  const getDateRange = useCallback(
    (key: string) => dateRanges[key] || { from: "", to: "" },
    [dateRanges],
  );

  const serverFiltersStr = useMemo(() => {
    const combined: Record<string, string[]> = { ...tableState.columnFilters };
    Object.entries(dateRanges).forEach(([key, range]) => {
      if (range?.from || range?.to) {
        combined[key] = [`${range.from || ""}..${range.to || ""}`];
      }
    });

    if (serviceTypeFilter && serviceTypeFilter !== "ALL") {
      combined["serviceType"] = [serviceTypeFilter];
    }

    return Object.keys(combined).length > 0
      ? JSON.stringify(combined)
      : undefined;
  }, [tableState.columnFilters, dateRanges, serviceTypeFilter]);

  const activeFilterCount = useMemo(() => {
    const activeDateCount = Object.values(dateRanges).filter((range) =>
      Boolean(range?.from || range?.to),
    ).length;
    return (
      (tableState.activeFilterCount || 0) +
      activeDateCount +
      (serviceTypeFilter !== "ALL" ? 1 : 0)
    );
  }, [tableState.activeFilterCount, dateRanges, serviceTypeFilter]);

  const clearAllFilters = useCallback(() => {
    tableState.resetFilters();
    setDateRanges({});
    setServiceTypeFilter("ALL");
    setSearch("");
    setPage(1);
  }, [tableState]);

  const fetchColumnOptions = useCallback(
    async ({
      columnKey,
      search: colSearch,
      pageParam,
      filtersStr,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
      filtersStr?: string;
    }) => {
      const res = await garageApi.getCaseServiceColumnOptions(
        selectedBranchId || "",
        columnKey,
        colSearch,
        pageParam,
        20,
        filtersStr || serverFiltersStr,
        serviceTypeFilter,
      );
      return {
        items: (res.items || []).map((item: string) => ({
          label: item,
          value: item,
        })),
        total: res.total || 0,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [selectedBranchId, serverFiltersStr, serviceTypeFilter],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "garage",
      "case-services",
      selectedBranchId,
      page,
      pageSize,
      search,
      serverFiltersStr,
      tableState.sorts,
    ],
    queryFn: () =>
      garageApi.getCaseServicesList(
        selectedBranchId || "",
        page,
        pageSize,
        search,
        undefined,
        undefined,
        serviceTypeFilter !== "ALL" ? serviceTypeFilter : undefined,
        serverFiltersStr,
        tableState.sorts,
      ),
    enabled: !!selectedBranchId,
    staleTime: 90_000,
  });

  const items = useMemo(() => data?.data || [], [data?.data]);
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;
  const totals = data?.totals;

  return {
    selectedBranchId,
    items,
    data,
    total,
    totalCount: total,
    totalPages,
    totals,
    page,
    pageSize,
    setPage,
    setPageSize,
    search,
    globalSearch: search,
    setSearch,
    serviceTypeFilter,
    setServiceTypeFilter: (val: string) => {
      setServiceTypeFilter(val);
      setPage(1);
    },
    tableState,
    dateRanges,
    setDateRange,
    getDateRange,
    serverFiltersStr,
    fetchColumnOptions,
    activeFilterCount,
    clearAllFilters,
    isLoading,
    isFetching,
    refetch,
  };
}
