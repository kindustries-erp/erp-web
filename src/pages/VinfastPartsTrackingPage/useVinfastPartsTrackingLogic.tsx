import { useState, useMemo, useCallback } from "react";
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
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";

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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);
  const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<VinfastPartTrackingRow | null>(
    null,
  );

  const tableState = useTableColumnState(
    `vinfast-parts-table-${vehicleType || "all"}`,
  );

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
  };
}
