import { useState, useCallback, useRef, useEffect } from "react";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import {
  listSinvoiceDraftsApi,
  type SinvoiceDraft,
} from "../api/sinvoiceDraftApi";

import { ErpUrlQueryParam } from "@/shared/constants/urlParams";

export function useSinvoiceDraftsList() {
  const [drafts, setDrafts] = useState<SinvoiceDraft[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get(
        ErpUrlQueryParam.PAGE,
      );
      const parsed = p ? parseInt(p, 10) : 1;
      return !isNaN(parsed) && parsed > 0 ? parsed : 1;
    }
    return 1;
  });
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window !== "undefined") {
      const s = new URLSearchParams(window.location.search).get(
        ErpUrlQueryParam.PAGE_SIZE,
      );
      const parsed = s ? parseInt(s, 10) : 50;
      return !isNaN(parsed) && parsed > 0 ? parsed : 50;
    }
    return 50;
  });

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
        sortKey: sortBy || undefined,
        sortDirection: sortOrder || undefined,
        filtersStr: Object.keys(tableState.columnFilters).length
          ? JSON.stringify(tableState.columnFilters)
          : undefined,
        dateFrom: filterPanel.state.dateFrom || undefined,
        dateTo: filterPanel.state.dateTo || undefined,
      });

      setDrafts(res.data);
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

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const p = params.get(ErpUrlQueryParam.PAGE);
      const parsedPage = p ? parseInt(p, 10) : 1;
      setPage(!isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1);

      const s = params.get(ErpUrlQueryParam.PAGE_SIZE);
      if (s) {
        const parsedSize = parseInt(s, 10);
        if (!isNaN(parsedSize) && parsedSize > 0) {
          setPageSize(parsedSize);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
