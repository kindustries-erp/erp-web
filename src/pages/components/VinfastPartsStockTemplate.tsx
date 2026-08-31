import { VinfastPartsStockExportDrawer } from "./VinfastPartsStockExportDrawer";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { ComingSoon } from "@/pages/ComingSoon";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, FileText, RefreshCw, DownloadCloud } from "lucide-react";
import api from "@/core/api/axiosInstance";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { type ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { TableText } from "@/shared/components/DataTable/TableText";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import { ErpApiEndpoint } from "@/shared/constants/apiEndpoints";
import { DEFAULT_DEBOUNCE_TIME } from "@/shared/constants/timing";
import { encodeStateParam } from "@/shared/utils/pageUrl";
import { VinfastPartsStockDetailDrawer } from "./VinfastPartsStockDetailDrawer";
import { VinfastPartsSyncDrawer } from "./VinfastPartsSyncDrawer";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

interface VinfastPartsStockTemplateProps {
  vehicleType: "oto" | "xemay";
  title: string;
  description?: string;
}

export function VinfastPartsStockTemplate({
  vehicleType,
  title,
  description,
}: VinfastPartsStockTemplateProps) {
  const { t } = useTranslation(["vinfastParts", "reports", "common"]);
  const hasVinfastPerm = useHasPermission(ErpResource.VINFAST, ErpAction.READ);
  const queryClient = useQueryClient();
  const [selectedSku, setSelectedSku] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get(ErpUrlQueryParam.DETAIL);
    }
    return null;
  });
  const [catalogData, setCatalogData] = useState<any>(null);
  const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const [page, setPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pageVal = params.get(ErpUrlQueryParam.PAGE);
      if (pageVal) return Math.max(1, parseInt(pageVal, 10) || 1);
    }
    return 1;
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sizeVal =
        params.get(ErpUrlQueryParam.PAGE_SIZE) ||
        params.get(ErpUrlQueryParam.LIMIT);
      if (sizeVal) return parseInt(sizeVal, 10) || getDefaultPageSize();
    }
    return getDefaultPageSize();
  });

  const tableState = useTableColumnState(`vinfast-parts-stock-${vehicleType}`);

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

  // ── Two-Way URL Sync Effect ───────────────────────────────────────────────
  const debounceUrlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (debounceUrlTimerRef.current) {
      clearTimeout(debounceUrlTimerRef.current);
    }

    debounceUrlTimerRef.current = setTimeout(() => {
      const currentUrl = new URL(window.location.href);
      const newParams = new URLSearchParams(currentUrl.search);

      // Detail drawer
      if (selectedSku) {
        newParams.set(ErpUrlQueryParam.DETAIL, selectedSku);
      } else {
        newParams.delete(ErpUrlQueryParam.DETAIL);
      }

      // Pagination
      if (page > 1) {
        newParams.set(ErpUrlQueryParam.PAGE, String(page));
      } else {
        newParams.delete(ErpUrlQueryParam.PAGE);
      }
      if (pageSize !== getDefaultPageSize()) {
        newParams.set(ErpUrlQueryParam.PAGE_SIZE, String(pageSize));
      } else {
        newParams.delete(ErpUrlQueryParam.PAGE_SIZE);
      }

      // Column filters (cf)
      if (Object.keys(tableState.columnFilters).length > 0) {
        const encoded = encodeStateParam(tableState.columnFilters);
        if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_FILTERS, encoded);
      } else {
        newParams.delete(ErpUrlQueryParam.COLUMN_FILTERS);
      }

      // Column search (cs)
      if (Object.keys(tableState.columnSearch).length > 0) {
        const encoded = encodeStateParam(tableState.columnSearch);
        if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_SEARCH, encoded);
      } else {
        newParams.delete(ErpUrlQueryParam.COLUMN_SEARCH);
      }

      // Sorts
      if (tableState.sorts.length > 0) {
        const encoded = encodeStateParam(tableState.sorts);
        if (encoded) newParams.set(ErpUrlQueryParam.SORTS, encoded);
      } else {
        newParams.delete(ErpUrlQueryParam.SORTS);
      }

      const newSearch = newParams.toString();
      const newRelativePath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`;
      if (
        window.location.pathname + window.location.search !==
        newRelativePath
      ) {
        window.history.replaceState(null, "", newRelativePath);
      }
    }, DEFAULT_DEBOUNCE_TIME);

    return () => {
      if (debounceUrlTimerRef.current)
        clearTimeout(debounceUrlTimerRef.current);
    };
  }, [
    selectedSku,
    page,
    pageSize,
    tableState.columnFilters,
    tableState.columnSearch,
    tableState.sorts,
  ]);

  // Handle popstate
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const detailParam = params.get(ErpUrlQueryParam.DETAIL);
      setSelectedSku(detailParam || null);

      const pageParam = params.get(ErpUrlQueryParam.PAGE);
      if (pageParam) {
        const p = parseInt(pageParam, 10);
        if (!isNaN(p)) setPage(p);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
    [vehicleType],
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
      page,
      pageSize,
      sortBy,
      sortOrder,
      tableState.columnSearch,
      tableState.columnFilters,
      tableState.sorts,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append(ErpUrlQueryParam.VEHICLE_TYPE, vehicleType);

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

      params.append(ErpUrlQueryParam.PAGE, page.toString());
      params.append(ErpUrlQueryParam.LIMIT, pageSize.toString());

      const res = await api.get(
        `${ErpApiEndpoint.VINFAST_PARTS_STOCK}?${params}`,
      );
      return res.data;
    },
  });

  const columns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      {
        key: "sku",
        header: headerFilter("sku", t("vinfastParts:PART_SKU", "Mã phụ tùng")),
        size: 200,
        enableResizing: true,
        headerClassName: "text-center",
        cell: (row) => (
          <TableText
            text={row.sku}
            enableCopy={true}
            tooltip={true}
            onDetailClick={(e) => {
              e.stopPropagation();
              setCatalogData(row);
              setSelectedSku(row.sku);
            }}
          />
        ),
      },
      {
        key: "name",
        header: headerFilter(
          "name",
          t("vinfastParts:PART_NAME", "Tên phụ tùng"),
        ),
        size: 300,
        enableResizing: true,
        headerClassName: "text-center",
        cell: (row) => (
          <div className="truncate w-full max-w-[280px]" title={row.name || ""}>
            {row.name || "—"}
          </div>
        ),
      },
      {
        key: "uom",
        header: headerFilter("uom", t("vinfastParts:UOM", "ĐVT"), {
          showBlankOption: true,
        }),
        size: 100,
        enableResizing: true,
        className: "text-center",
        headerClassName: "text-center",
        cell: (row) => row.uom || "—",
      },
      {
        key: "qtyIn",
        header: headerFilter.numeric(
          "qtyIn",
          t("vinfastParts:TOTAL_IN", "Tổng Nhập"),
        ),
        size: 120,
        enableResizing: true,
        className: "text-right font-medium text-emerald-700 tabular-nums",
        headerClassName: "text-right",
        cell: (row) => Number(row.qtyIn || 0).toLocaleString("vi-VN"),
      },
      {
        key: "qtyOut",
        header: headerFilter.numeric(
          "qtyOut",
          t("vinfastParts:TOTAL_OUT", "Tổng Xuất"),
        ),
        size: 120,
        enableResizing: true,
        className: "text-right font-medium text-rose-700 tabular-nums",
        headerClassName: "text-right",
        cell: (row) => Number(row.qtyOut || 0).toLocaleString("vi-VN"),
      },
      {
        key: "qtyBalance",
        header: headerFilter.numeric(
          "qtyBalance",
          t("vinfastParts:BALANCE", "Tồn cuối"),
        ),
        size: 120,
        enableResizing: true,
        className: "text-right font-bold text-slate-800 tabular-nums",
        headerClassName: "text-right",
        cell: (row) => Number(row.qtyBalance || 0).toLocaleString("vi-VN"),
      },
    ],
    [headerFilter, t],
  );

  const getRowActions = useCallback(
    (row: any): ActionDropdownItem[] => [
      {
        groupLabel: t("vinfastParts:SEARCH", "TRA CỨU"),
        items: [
          {
            label: t("vinfastParts:VIEW_DETAILS", "Xem chi tiết"),
            icon: <Eye className="w-3.5 h-3.5" />,
            onClick: () => {
              setCatalogData(row);
              setSelectedSku(row.sku);
            },
          },
        ],
      },
    ],
    [t],
  );

  const totals = useMemo(() => {
    const items = data?.data || [];
    return items.reduce(
      (
        acc: { qtyIn: number; qtyOut: number; qtyBalance: number },
        row: any,
      ) => ({
        qtyIn: acc.qtyIn + Number(row.qtyIn || 0),
        qtyOut: acc.qtyOut + Number(row.qtyOut || 0),
        qtyBalance: acc.qtyBalance + Number(row.qtyBalance || 0),
      }),
      { qtyIn: 0, qtyOut: 0, qtyBalance: 0 },
    );
  }, [data?.data]);

  const summaryRow = useMemo(
    () => ({
      name: (
        <div className="text-right w-full font-semibold">
          {t("common:total", "Tổng cộng")}:
        </div>
      ),
      qtyIn: (
        <div className="text-right font-semibold text-emerald-700 tabular-nums">
          {totals.qtyIn.toLocaleString("vi-VN")}
        </div>
      ),
      qtyOut: (
        <div className="text-right font-semibold text-rose-700 tabular-nums">
          {totals.qtyOut.toLocaleString("vi-VN")}
        </div>
      ),
      qtyBalance: (
        <div className="text-right font-bold text-slate-800 tabular-nums">
          {totals.qtyBalance.toLocaleString("vi-VN")}
        </div>
      ),
    }),
    [totals, t],
  );

  if (!hasVinfastPerm) {
    return <ComingSoon />;
  }

  return (
    <>
      <SpreadsheetPageTemplate
        tableId={`vinfast-parts-stock-${vehicleType}`}
        title={title}
        desc={description}
        icon={<FileText className="w-5 h-5 text-gray-500" />}
        onRefresh={() =>
          queryClient.invalidateQueries({
            queryKey: ["vinfast-parts-stock", vehicleType],
          })
        }
        activeFilterCount={tableState.activeFilterCount}
        onClearAllFilters={() => tableState.resetFilters()}
        createLabel={t("vinfastParts:CREATE_NEW", "Tạo mới")}
        createActions={[
          {
            groupLabel: t("vinfastParts:SYSTEM", "HỆ THỐNG"),
            items: [
              {
                label: t("vinfastParts:SYNC_LEDGER", "Đồng bộ sổ cái"),
                icon: <RefreshCw className="w-4 h-4 text-blue-600" />,
                onClick: () => {
                  setSyncDrawerOpen(true);
                },
              },
            ],
          },
          {
            groupLabel: t("vinfastParts:SEARCH", "TRA CỨU"),
            items: [
              {
                label: t("vinfastParts:DOWNLOAD_REPORT", "Tải bảng kê"),
                icon: <DownloadCloud className="w-4 h-4 text-green-600" />,
                onClick: () => {
                  setExportOpen(true);
                },
              },
            ],
          },
        ]}
        rowActions={getRowActions}
        summaryRow={summaryRow}
        emptyLabel={t("common:noData", "Không có dữ liệu")}
        items={data?.data || []}
        columns={columns}
        loading={isLoading || isFetching}
        page={page}
        pageSize={pageSize}
        total={data?.total || 0}
        totalPages={data?.totalPages || 0}
        onPage={setPage}
        onPageSize={setPageSize}
        getRowKey={(row: any) => row.sku}
      />

      <VinfastPartsStockDetailDrawer
        open={!!selectedSku}
        onClose={() => {
          setSelectedSku(null);
          setCatalogData(null);
        }}
        sku={selectedSku || ""}
        catalogData={catalogData}
      />

      <VinfastPartsSyncDrawer
        open={syncDrawerOpen}
        onClose={() => setSyncDrawerOpen(false)}
      />

      <VinfastPartsStockExportDrawer
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        buildBaseQuery={() => ({
          vehicleType,
          search:
            tableState.columnSearch["name"] ||
            tableState.columnSearch["sku"] ||
            "",
          sortBy: activeSort ? activeSort.replace("-", "") : undefined,
          sortDir: sortOrder as any,
          sorts: JSON.stringify(tableState.sorts),
          columnSearch: JSON.stringify(tableState.columnSearch),
          columnFilters: JSON.stringify(tableState.columnFilters),
        })}
      />
    </>
  );
}
