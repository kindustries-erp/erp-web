import { useState, useMemo, useCallback } from "react";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { useGarageCases, useGarageGrossProfit } from "../../../hooks/useGarage";
import { garageApi } from "../../../api/garageApi";
import { applyGarageCasesTableState } from "../../../utils/garageCasesTable";
import type { GarageCasesTableProps } from "./GarageCasesTable.type";

export function useGarageCasesTable(props: GarageCasesTableProps) {
  const { branchId, activeStatusTab, dateRanges, onResetDateRanges } = props;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const tableState = useTableColumnState("garage-cases-table");

  const handleSortChange = useCallback(
    (key: string, state: "asc" | "desc" | "none") => {
      tableState.setSort(key, state);
      setPage(1);
    },
    [tableState],
  );

  const handleSearchChange = useCallback(
    (key: string, search: string) => {
      tableState.setColumnSearch(key, search);
      setPage(1);
    },
    [tableState],
  );

  const handleFilterChange = useCallback(
    (key: string, filters: string[]) => {
      tableState.setColumnFilter(key, filters);
      setPage(1);
    },
    [tableState],
  );

  const serverFiltersStr = useMemo(() => {
    const combined: Record<string, string[]> = { ...tableState.columnFilters };

    Object.entries(tableState.columnSearch).forEach(([key, searchVal]) => {
      const s = typeof searchVal === "string" ? searchVal.trim() : "";
      if (s && (!combined[key] || combined[key].length === 0)) {
        combined[key] = ["__ALL_MATCHING__", s];
      }
    });

    Object.entries(dateRanges).forEach(([key, range]) => {
      if ((range?.from || range?.to) && key !== "caseDate") {
        combined[key] = [`${range.from || ""}..${range.to || ""}`];
      }
    });

    if (activeStatusTab && activeStatusTab !== "all") {
      if (!combined["statusName"] || combined["statusName"].length === 0) {
        combined["statusTab"] = [activeStatusTab];
      }
    }

    return Object.keys(combined).length > 0
      ? JSON.stringify(combined)
      : undefined;
  }, [
    tableState.columnFilters,
    tableState.columnSearch,
    dateRanges,
    activeStatusTab,
  ]);

  const activeFilterCount = useMemo(() => {
    const activeDateCount = Object.values(dateRanges).filter((r) =>
      Boolean(r?.from || r?.to),
    ).length;
    return (tableState.activeFilterCount || 0) + activeDateCount;
  }, [tableState.activeFilterCount, dateRanges]);

  const handleClearAllFilters = useCallback(() => {
    tableState.resetFilters();
    onResetDateRanges();
    setPage(1);
  }, [tableState, onResetDateRanges]);

  const dateFrom = dateRanges["caseDate"]?.from || undefined;
  const dateTo = dateRanges["caseDate"]?.to || undefined;

  const {
    data: casesData,
    isLoading,
    isFetching,
    refetch,
  } = useGarageCases(
    branchId,
    page,
    pageSize,
    "",
    dateFrom,
    dateTo,
    serverFiltersStr,
    undefined,
    tableState.sorts,
  );

  const { data: profitData } = useGarageGrossProfit(branchId);
  const profitCases = useMemo(() => {
    const groups = profitData?.results?.Groups || profitData?.Groups || [];
    return groups.flatMap((g: any) => g.Items || []);
  }, [profitData]);

  const cases = casesData?.data || [];
  const visibleCases = useMemo(
    () =>
      applyGarageCasesTableState(
        cases,
        tableState,
        "",
        dateRanges,
        activeStatusTab,
      ),
    [cases, tableState, dateRanges, activeStatusTab],
  );

  const total = casesData?.pagination?.total || 0;
  const totals = casesData?.totals;

  const fetchCaseColumnOptions = useCallback(
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
      const res = await garageApi.getCaseColumnOptions(
        branchId || "",
        columnKey,
        search,
        pageParam,
        20,
        filtersStr,
      );
      return {
        items: res.items.map((item: any) =>
          typeof item === "object" && item !== null
            ? item
            : { label: item, value: item },
        ),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [branchId],
  );

  return {
    tableState,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    cases,
    visibleCases,
    profitCases,
    totals,
    isLoading,
    isFetching,
    refetch,
    activeFilterCount,
    handleSortChange,
    handleSearchChange,
    handleFilterChange,
    handleClearAllFilters,
    fetchCaseColumnOptions,
  };
}
