import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";

export interface UseBankTransactionPartnerLogicOptions {
  transaction: any | null;
  initialPageSize?: number;
}

export function useBankTransactionPartnerLogic({
  transaction,
  initialPageSize = 20,
}: UseBankTransactionPartnerLogicOptions) {
  const partnerName = transaction?.correspondentName?.trim() || "";
  const correspondentAccount = transaction?.correspondentAccount?.trim() || "";

  // ── Table State ───
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sorts, setSorts] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [columnSearch, setColumnSearchState] = useState<Record<string, string>>(
    {},
  );

  const setSort = useCallback((key: string, state: "asc" | "desc" | "none") => {
    setSorts((prev) => {
      const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
      if (state === "asc") return [...filtered, key];
      if (state === "desc") return [...filtered, `-${key}`];
      return filtered;
    });
    setPage(1);
  }, []);

  const setColumnFilter = useCallback((key: string, vals: string[]) => {
    setColumnFilters((prev) => {
      if (!vals || vals.length === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: vals };
    });
    setPage(1);
  }, []);

  const setColumnSearch = useCallback((key: string, val: string) => {
    setColumnSearchState((prev) => {
      if (!val || val.trim().length === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: val };
    });
    setPage(1);
  }, []);

  const setDateRange = useCallback((from?: string, to?: string) => {
    setDateFrom(from || "");
    setDateTo(to || "");
    setPage(1);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += 1;
    });
    Object.values(columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    if (dateFrom || dateTo) count += 1;
    return count;
  }, [columnFilters, columnSearch, dateFrom, dateTo]);

  const clearAllFilters = useCallback(() => {
    setColumnFilters({});
    setColumnSearchState({});
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, []);

  // ── Sorting resolution ───
  const activeSort = sorts[0] || "";
  let sortBy = "transDate";
  let sortOrder: "ASC" | "DESC" = "DESC";
  if (activeSort.startsWith("-")) {
    sortBy = activeSort.substring(1);
    sortOrder = "DESC";
  } else if (activeSort) {
    sortBy = activeSort;
    sortOrder = "ASC";
  }

  // ── Fetch Transactions List ───
  const {
    data: tableData,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      "partner-bank-transactions",
      correspondentAccount,
      partnerName,
      page,
      pageSize,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
      columnFilters,
      columnSearch,
    ],
    queryFn: () =>
      bankStatementApi.getTransactions({
        page,
        pageSize,
        sortBy,
        sortOrder,
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
        correspondentAccount: correspondentAccount || undefined,
        correspondentName: partnerName || undefined,
        column_search:
          Object.keys(columnSearch).length > 0
            ? JSON.stringify(columnSearch)
            : undefined,
        column_filters:
          Object.keys(columnFilters).length > 0
            ? JSON.stringify(columnFilters)
            : undefined,
      }),
    enabled: Boolean(correspondentAccount || partnerName),
  });

  const items = useMemo(() => tableData?.items || [], [tableData]);
  const total = tableData?.total || 0;
  const totalPages = tableData?.totalPages || 0;

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
      let currentFilters: Record<string, string[]> = {};
      if (filtersStr) {
        try {
          currentFilters = JSON.parse(filtersStr);
        } catch {
          // ignore
        }
      }
      if (correspondentAccount) {
        currentFilters["correspondentAccount"] = [correspondentAccount];
      }
      if (partnerName) {
        currentFilters["correspondentName"] = [partnerName];
      }
      return bankStatementApi.getColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        JSON.stringify(currentFilters),
      );
    },
    [correspondentAccount, partnerName],
  );

  return {
    partnerName,
    correspondentAccount,
    page,
    setPage,
    pageSize,
    setPageSize,
    sorts,
    setSort,
    dateFrom,
    dateTo,
    setDateRange,
    columnFilters,
    setColumnFilter,
    columnSearch,
    setColumnSearch,
    activeFilterCount,
    clearAllFilters,
    items,
    total,
    totalPages,
    isFetching,
    refetch,
    fetchColumnOptions,
  };
}
