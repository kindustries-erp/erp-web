import { useState, useCallback, useRef, useEffect } from "react";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import {
  listSinvoiceDraftsApi,
  type SinvoiceDraft,
} from "../api/sinvoiceDraftApi";

export function useSinvoiceDraftsList() {
  const [drafts, setDrafts] = useState<SinvoiceDraft[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const [search, setSearch] = useState("");

  const tableState = useTableColumnState("sinvoice-drafts-table");
  const filterPanel = useFilterPanel({ period: true, noDefaultPeriod: true });

  const activeSort = tableState.sorts[0] || "";
  let sortBy = "";
  let sortOrder: "asc" | "desc" = "desc";
  if (activeSort.startsWith("-")) {
    sortBy = activeSort.substring(1);
    sortOrder = "desc";
  } else if (activeSort) {
    sortBy = activeSort;
    sortOrder = "asc";
  } else {
    sortBy = "createdAt";
    sortOrder = "desc";
  }

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const debounce = (fn: () => void) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, 400);
  };

  const loadDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listSinvoiceDraftsApi({
        page,
        pageSize,
        search: search || undefined,
        filtersStr: Object.keys(tableState.columnFilters).length
          ? JSON.stringify(tableState.columnFilters)
          : undefined,
        dateFrom: filterPanel.state.dateFrom || undefined,
        dateTo: filterPanel.state.dateTo || undefined,
      });

      let items = res.data;
      if (sortBy && sortBy !== "createdAt") {
        items = [...items].sort((a: any, b: any) => {
          const valA = a[sortBy];
          const valB = b[sortBy];
          if (valA < valB) return sortOrder === "asc" ? -1 : 1;
          if (valA > valB) return sortOrder === "asc" ? 1 : -1;
          return 0;
        });
      }

      setDrafts(items);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      console.error("Failed to load drafts", err);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    search,
    tableState.columnFilters,
    filterPanel.state.dateFrom,
    filterPanel.state.dateTo,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    debounce(() => {
      loadDrafts();
    });
  }, [
    page,
    pageSize,
    search,
    JSON.stringify(tableState.columnFilters),
    filterPanel.state.dateFrom,
    filterPanel.state.dateTo,
    sortBy,
    sortOrder,
  ]);

  return {
    drafts,
    total,
    totalPages,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    tableState,
    filterPanel,
    loadDrafts,
  };
}
