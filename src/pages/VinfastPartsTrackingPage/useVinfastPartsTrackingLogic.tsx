import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Download } from "lucide-react";
import api from "@/core/api/axiosInstance";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { useUIStore } from "@/core/config/uiStore";
import { useAppStore } from "@/core/config/appStore";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import { DEFAULT_DEBOUNCE_TIME } from "@/shared/constants/timing";
import { encodeStateParam } from "@/shared/utils/pageUrl";

import type {
  VinfastPartTrackingRow,
  VinfastPartsTrackingPageProps,
} from "./types";
import { useVinfastPartsColumns } from "./hooks/useVinfastPartsColumns";

export function useVinfastPartsTrackingLogic({
  vehicleType,
}: VinfastPartsTrackingPageProps) {
  const { t } = useTranslation("vinfast");
  const formHook = useErpInvoiceForm(() => {});
  const showToast = useUIStore((s) => s.showToast);

  const [page, setPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get(
        ErpUrlQueryParam.PAGE,
      );
      const parsed = p ? parseInt(p, 10) : 1;
      return !isNaN(parsed) && parsed > 0 ? parsed : 1;
    }
    return 1;
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const s = new URLSearchParams(window.location.search).get(
        ErpUrlQueryParam.PAGE_SIZE,
      );
      const parsed = s ? parseInt(s, 10) : 50;
      return !isNaN(parsed) && parsed > 0 ? parsed : 50;
    }
    return 50;
  });

  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);
  const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<VinfastPartTrackingRow | null>(
    null,
  );

  const tableId = `vinfast-parts-table-${vehicleType || "all"}`;
  const tableState = useTableColumnState(tableId);

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
    sortBy = "month";
    sortOrder = "desc";
  }

  const getSortState = useCallback(
    (key: string) => {
      if (tableState.sorts.includes(key)) return "asc";
      if (tableState.sorts.includes(`-${key}`)) return "desc";
      return "none";
    },
    [tableState.sorts],
  );

  const handleSortChange = useCallback(
    (key: string, state: "asc" | "desc" | "none") => {
      tableState.setSort(key, state);
      setPage(1);
    },
    [tableState],
  );

  const handleSearchChange = useCallback(
    (key: string, val: string) => {
      tableState.setColumnSearch(key, val);
      setPage(1);
    },
    [tableState],
  );

  const handleFilterChange = useCallback(
    (key: string, vals: string[]) => {
      tableState.setColumnFilter(key, vals);
      setPage(1);
    },
    [tableState],
  );

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
      if (vehicleType) {
        parsedFilters["vehicleType"] = [vehicleType];
      }
      const res = await api.get(
        "/api/v1/reports/vinfast-parts/column-options",
        {
          params: {
            columnKey,
            search,
            page: pageParam,
            limit: 20,
            filters: JSON.stringify(parsedFilters),
          },
        },
      );
      return {
        items: res.data.items,
        total: res.data.total,
        next: res.data.page < res.data.totalPages ? res.data.page + 1 : null,
      };
    },
    [vehicleType],
  );

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      period: true,
      noDefaultPeriod: true,
    }),
    [],
  );

  const filterProps = useFilterPanel(filterConfig, () => setPage(1));
  const { state: filterState } = filterProps;

  // ── Two-Way URL Sync Engine ────────────────────────────────────────────────
  const debounceUrlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const syncUrlToBrowser = useCallback(() => {
    if (typeof window === "undefined") return;
    const currentUrl = new URL(window.location.href);
    const newParams = new URLSearchParams(currentUrl.search);

    // 1. Tab / vehicleType
    if (vehicleType) {
      newParams.set(ErpUrlQueryParam.TAB, vehicleType.toLowerCase());
    }

    // 2. Pagination
    if (page > 1) {
      newParams.set(ErpUrlQueryParam.PAGE, String(page));
    } else {
      newParams.delete(ErpUrlQueryParam.PAGE);
    }
    if (pageSize) {
      newParams.set(ErpUrlQueryParam.PAGE_SIZE, String(pageSize));
    }

    // 3. Filters (search, dateFrom, dateTo)
    if (filterState.search) {
      newParams.set(ErpUrlQueryParam.SEARCH, filterState.search);
    } else {
      newParams.delete(ErpUrlQueryParam.SEARCH);
    }
    if (filterState.dateFrom) {
      newParams.set(ErpUrlQueryParam.DATE_FROM, filterState.dateFrom);
    } else {
      newParams.delete(ErpUrlQueryParam.DATE_FROM);
    }
    if (filterState.dateTo) {
      newParams.set(ErpUrlQueryParam.DATE_TO, filterState.dateTo);
    } else {
      newParams.delete(ErpUrlQueryParam.DATE_TO);
    }

    // 4. Column Filters (cf), Search (cs), Sorts
    if (Object.keys(tableState.columnFilters).length > 0) {
      const encoded = encodeStateParam(tableState.columnFilters);
      if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_FILTERS, encoded);
    } else {
      newParams.delete(ErpUrlQueryParam.COLUMN_FILTERS);
    }

    if (Object.keys(tableState.columnSearch).length > 0) {
      const encoded = encodeStateParam(tableState.columnSearch);
      if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_SEARCH, encoded);
    } else {
      newParams.delete(ErpUrlQueryParam.COLUMN_SEARCH);
    }

    if (tableState.sorts.length > 0) {
      const encoded = encodeStateParam(tableState.sorts);
      if (encoded) newParams.set(ErpUrlQueryParam.SORTS, encoded);
    } else {
      newParams.delete(ErpUrlQueryParam.SORTS);
    }

    const newSearch = newParams.toString();
    const newRelativePath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`;
    if (window.location.pathname + window.location.search !== newRelativePath) {
      window.history.replaceState(null, "", newRelativePath);
      const tabId = vehicleType
        ? `vinfast-parts-${vehicleType.toLowerCase()}`
        : "vinfast-parts";
      useAppStore.getState().updateCurrentTabUrl(tabId, newRelativePath);
    }
  }, [
    vehicleType,
    page,
    pageSize,
    filterState.search,
    filterState.dateFrom,
    filterState.dateTo,
    tableState.columnFilters,
    tableState.columnSearch,
    tableState.sorts,
  ]);

  useEffect(() => {
    if (debounceUrlTimerRef.current) {
      clearTimeout(debounceUrlTimerRef.current);
    }
    debounceUrlTimerRef.current = setTimeout(() => {
      syncUrlToBrowser();
    }, DEFAULT_DEBOUNCE_TIME);

    return () => {
      if (debounceUrlTimerRef.current) {
        clearTimeout(debounceUrlTimerRef.current);
      }
    };
  }, [syncUrlToBrowser]);

  // Handle popstate for 2-way sync
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);

      const pageParam = params.get(ErpUrlQueryParam.PAGE);
      if (pageParam) {
        const p = parseInt(pageParam, 10);
        if (!isNaN(p) && p > 0) setPage(p);
      } else {
        setPage(1);
      }

      const sizeParam =
        params.get(ErpUrlQueryParam.PAGE_SIZE) ||
        params.get(ErpUrlQueryParam.LIMIT);
      if (sizeParam) {
        const s = parseInt(sizeParam, 10);
        if (!isNaN(s) && s > 0) setPageSize(s);
      }

      const searchParam = params.get(ErpUrlQueryParam.SEARCH);
      if (searchParam !== null) filterProps.setSearchInput(searchParam);

      const df = params.get(ErpUrlQueryParam.DATE_FROM);
      const dt = params.get(ErpUrlQueryParam.DATE_TO);
      if (df !== null) filterProps.setDateFrom(df);
      if (dt !== null) filterProps.setDateTo(dt);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [filterProps]);

  const commonFilterProps = useMemo(
    () => ({
      enableSelectAllMatching: true,
      queryKeyPrefix: `vinfast-parts-options-${vehicleType || "all"}`,
      allFilters: tableState.columnFilters,
      fetchOptions: fetchColumnOptions,
    }),
    [tableState.columnFilters, fetchColumnOptions, vehicleType],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "vinfast-parts",
      vehicleType || "all",
      page,
      pageSize,
      sortBy,
      sortOrder,
      filterState.dateFrom,
      filterState.dateTo,
      filterState.search,
      tableState.columnSearch,
      tableState.columnFilters,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterState.dateFrom) params.append("dateFrom", filterState.dateFrom);
      if (filterState.dateTo) params.append("dateTo", filterState.dateTo);
      if (filterState.search) params.append("search", filterState.search);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortDir", sortOrder);
      if (tableState.sorts.length > 0)
        params.append("sorts", JSON.stringify(tableState.sorts));
      if (Object.keys(tableState.columnSearch).length > 0)
        params.append("column_search", JSON.stringify(tableState.columnSearch));

      const finalColumnFilters = { ...tableState.columnFilters };
      if (vehicleType) {
        finalColumnFilters["vehicleType"] = [vehicleType];
      }
      if (Object.keys(finalColumnFilters).length > 0)
        params.append("column_filters", JSON.stringify(finalColumnFilters));
      params.append("page", page.toString());
      params.append("limit", pageSize.toString());

      const res = await api.get(`/api/v1/reports/vinfast-parts?${params}`);
      return res.data as { data: VinfastPartTrackingRow[]; total: number };
    },
  });

  const { columns, summaryRow } = useVinfastPartsColumns({
    tableState,
    getSortState,
    handleSortChange,
    handleSearchChange,
    handleFilterChange,
    filterState,
    filterProps,
    commonFilterProps,
    formHook,
    setDetailRow,
    setPage,
    data,
  });

  const buildExportBaseQuery = useCallback(() => {
    const payload: Record<string, string> = {};

    if (filterState.search) payload.search = filterState.search;
    if (sortBy) payload.sortBy = sortBy;
    if (sortOrder) payload.sortDir = sortOrder;
    if (tableState.sorts.length > 0)
      payload.sorts = JSON.stringify(tableState.sorts);
    if (Object.keys(tableState.columnSearch).length > 0) {
      payload.columnSearch = JSON.stringify(tableState.columnSearch);
    }

    const finalExportFilters = { ...tableState.columnFilters };
    if (vehicleType) {
      finalExportFilters["vehicleType"] = [vehicleType];
    }
    if (Object.keys(finalExportFilters).length > 0) {
      payload.columnFilters = JSON.stringify(finalExportFilters);
    }

    return payload;
  }, [
    filterState.search,
    sortBy,
    sortOrder,
    tableState.columnFilters,
    tableState.columnSearch,
    tableState.sorts,
    vehicleType,
  ]);

  const createActions = useMemo(
    () => [
      {
        groupLabel: t("groupSystem", "HỆ THỐNG"),
        items: [
          {
            label: t("syncLedger", "Đồng bộ sổ cái"),
            icon: <RefreshCw className="w-4 h-4 text-blue-600" />,
            onClick: () => {
              setSyncDrawerOpen(true);
            },
          },
        ],
      },
      {
        groupLabel: t("groupSearch", "TRA CỨU"),
        items: [
          {
            label: t("downloadReport", "Tải bảng kê"),
            icon: <Download className="w-4 h-4 text-green-600" />,
            onClick: () => {
              setExportDrawerOpen(true);
            },
          },
        ],
      },
      {
        groupLabel: t("groupActions", "THAO TÁC"),
        items: [
          {
            label: t("syncPartCodes", "Đồng bộ mã phụ tùng"),
            icon: <RefreshCw className="w-4 h-4 text-blue-600" />,
            onClick: () => {
              refetch();
              showToast({
                title: t("toastSuccess", "Thành công"),
                description: t(
                  "toastSyncSuccessDesc",
                  "Đã đồng bộ và trích xuất lại dữ liệu phụ tùng mới nhất!",
                ),
              });
            },
          },
        ],
      },
    ],
    [refetch, showToast, t],
  );

  const handleClearAllFilters = useCallback(() => {
    tableState.resetFilters();
    filterProps.resetAll();
    setPage(1);

    if (typeof window !== "undefined") {
      const newParams = new URLSearchParams();
      if (vehicleType) {
        newParams.set(ErpUrlQueryParam.TAB, vehicleType.toLowerCase());
      }
      if (pageSize) {
        newParams.set(ErpUrlQueryParam.PAGE_SIZE, String(pageSize));
      }
      const newSearch = newParams.toString();
      const newRelativePath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`;
      window.history.replaceState(null, "", newRelativePath);
      const tabId = vehicleType
        ? `vinfast-parts-${vehicleType.toLowerCase()}`
        : "vinfast-parts";
      useAppStore.getState().updateCurrentTabUrl(tabId, newRelativePath);
    }
  }, [tableState, filterProps, vehicleType, pageSize]);

  return {
    vehicleType,
    page,
    setPage,
    pageSize,
    setPageSize,
    exportDrawerOpen,
    setExportDrawerOpen,
    syncDrawerOpen,
    setSyncDrawerOpen,
    detailRow,
    setDetailRow,
    tableState,
    filterState,
    formHook,
    data,
    isLoading,
    isFetching,
    refetch,
    summaryRow,
    columns,
    createActions,
    buildExportBaseQuery,
    handleClearAllFilters,
  };
}
