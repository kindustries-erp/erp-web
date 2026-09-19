import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ErpQueryKey, DEFAULT_STALE_TIME } from "@/shared/lib/queryKeys";
import { accountingApi } from "@/modules/accounting/api/accountingApi";
import type {
  JournalEntriesQueryParams,
  JournalEntryItem,
  JournalEntrySpreadsheetRow,
} from "@/modules/accounting/types/journalEntry";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export function useJournalEntriesList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [sorts, setSorts] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [columnSearch, setColumnSearchMap] = useState<Record<string, string>>(
    {},
  );
  const [activeSourceType, setActiveSourceTypeState] = useState<string>("ALL");

  const queryParams = useMemo<JournalEntriesQueryParams>(() => {
    const params: JournalEntriesQueryParams = {
      page,
      pageSize,
    };

    if (sorts.length > 0) {
      params.sorts = sorts;
    }

    if (activeSourceType && activeSourceType !== "ALL") {
      params.source_type = activeSourceType;
    }

    if (dateFrom) {
      params.date_from = dateFrom;
    }
    if (dateTo) {
      params.date_to = dateTo;
    }

    if (Object.keys(columnFilters).length > 0) {
      params.column_filters = JSON.stringify(columnFilters);
    }

    if (Object.keys(columnSearch).length > 0) {
      params.column_search = JSON.stringify(columnSearch);
    }

    return params;
  }, [
    page,
    pageSize,
    sorts,
    activeSourceType,
    dateFrom,
    dateTo,
    columnFilters,
    columnSearch,
  ]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      ErpQueryKey.JOURNAL_ENTRIES,
      activeSourceType,
      page,
      pageSize,
      sorts,
      dateFrom,
      dateTo,
      columnFilters,
      columnSearch,
    ],
    queryFn: () => accountingApi.getJournalEntries(queryParams),
    staleTime: DEFAULT_STALE_TIME,
  });

  const flattenedData = useMemo<JournalEntrySpreadsheetRow[]>(() => {
    if (!data?.items) return [];
    const result: JournalEntrySpreadsheetRow[] = [];

    data.items.forEach((entry: JournalEntryItem) => {
      const entryNo = entry.entryNo || entry.voucher_no || "";
      const status = String(entry.status || "");
      const lines = entry.lines ?? [];

      if (lines.length > 0) {
        const sortedLines = [...lines].sort(
          (a: any, b: any) => (Number(a.sort) || 0) - (Number(b.sort) || 0),
        );

        sortedLines.forEach((line: any, index: number) => {
          const isDebit = Number(line.debit) > 0;
          const opposingLine = sortedLines[isDebit ? index + 1 : index - 1];
          const opposingAccountCode =
            opposingLine?.account?.accountCode ||
            opposingLine?.account?.account_code ||
            "";

          result.push({
            id: line.id || `${entry.id}-${index}`,
            _id: `${entry.id}-${line.id || index}`,
            _entryNo: entryNo,
            _date: entry.date,
            _documentDate: entry.documentDate,
            _status: status,
            _description: entry.description,
            _reference: entry.reference,
            _branch: entry.branch?.name,
            _sourceId: entry.sourceId,
            _sourceType: entry.sourceType,
            _subjectName: entry.subjectName,
            _account:
              line.account?.accountCode || line.account?.account_code || "",
            _opposingAccount: opposingAccountCode,
            debit: Number(line.debit) || 0,
            credit: Number(line.credit) || 0,
            description: line.description || entry.description,
            sort: line.sort,
            isFirstLine: index === 0,
            rowSpan: index === 0 ? lines.length : 0,
          });
        });
      } else {
        result.push({
          id: entry.id,
          _id: entry.id,
          _entryNo: entryNo,
          _date: entry.date,
          _documentDate: entry.documentDate,
          _status: status,
          _description: entry.description,
          _reference: entry.reference,
          _branch: entry.branch?.name,
          _sourceId: entry.sourceId,
          _sourceType: entry.sourceType,
          _subjectName: entry.subjectName,
          _account: "",
          _opposingAccount: "",
          debit: 0,
          credit: 0,
          description: entry.description,
          isFirstLine: true,
          rowSpan: 1,
        });
      }
    });

    return result;
  }, [data]);

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
      const next = { ...prev };
      if (!vals || vals.length === 0) {
        delete next[key];
      } else {
        next[key] = vals;
      }
      return next;
    });
    setPage(1);
  }, []);

  const setColumnSearch = useCallback((key: string, val: string) => {
    setColumnSearchMap((prev) => {
      const next = { ...prev };
      if (!val || val.trim().length === 0) {
        delete next[key];
      } else {
        next[key] = val.trim();
      }
      return next;
    });
    setPage(1);
  }, []);

  const setDateRange = useCallback((from?: string, to?: string) => {
    setDateFrom(from || "");
    setDateTo(to || "");
    setPage(1);
  }, []);

  const setActiveSourceType = useCallback((sourceType: string) => {
    setActiveSourceTypeState(sourceType);
    setPage(1);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += vals.length;
    });
    Object.values(columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    if (dateFrom || dateTo) count += 1;
    if (activeSourceType && activeSourceType !== "ALL") count += 1;
    return count;
  }, [columnFilters, columnSearch, dateFrom, dateTo, activeSourceType]);

  const clearAllFilters = useCallback(() => {
    setColumnFilters({});
    setColumnSearchMap({});
    setDateFrom("");
    setDateTo("");
    setSorts([]);
    setActiveSourceTypeState("ALL");
    setPage(1);
  }, []);

  return {
    data: flattenedData,
    rawItems: (data?.items as JournalEntryItem[]) ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    totals: data?.totals,
    isLoading: isLoading || isFetching,
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
    activeSourceType,
    setActiveSourceType,
    activeFilterCount,
    clearAllFilters,
    refetch,
  };
}
