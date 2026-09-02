import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, FileText, RefreshCw, DownloadCloud } from "lucide-react";
import api from "@/core/api/axiosInstance";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { PillTabs } from "@/shared/components/PillTabs";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { type ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { TableText } from "@/shared/components/DataTable/TableText";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { ComingSoon } from "@/pages/ComingSoon";
import { useAppStore } from "@/core/config/appStore";
import type { TabItem } from "@/shared/components/PageLayout";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import { ErpApiEndpoint } from "@/shared/constants/apiEndpoints";
import { DEFAULT_DEBOUNCE_TIME } from "@/shared/constants/timing";
import { encodeStateParam } from "@/shared/utils/pageUrl";
import { VinfastPartsDashboardPage } from "./VinfastPartsDashboardPage";
import { VinfastPartsStockDetailDrawer } from "./components/VinfastPartsStockDetailDrawer";
import { VinfastPartsSyncDrawer } from "./components/VinfastPartsSyncDrawer";
import { VinfastPartsStockExportDrawer } from "./components/VinfastPartsStockExportDrawer";
import { useVinfastPartsParallelPrefetch } from "./hooks/useVinfastPartsParallelPrefetch";
import {
  useVinfastPartsStockStore,
  getDefaultVinfastPageSize,
  type VehicleStockType,
  type VinfastStockTab,
  type VinfastPartsStockTabState,
} from "./hooks/useVinfastPartsStockStore";

export const getDefaultPageSize = getDefaultVinfastPageSize;

export type VinfastPartsStockTab = "dashboard" | "oto" | "xemay";

export interface VinfastPartsStockPageProps {
  initialTab?: VinfastPartsStockTab;
}

export function VinfastPartsStockPage({
  initialTab,
}: VinfastPartsStockPageProps) {
  const { t } = useTranslation(["vinfastParts", "nav", "common"]);
  const { setCustomBreadcrumbs } = useAppStore();

  const [activeTab, setActiveTab] = useState<VinfastPartsStockTab>(() => {
    if (initialTab) return initialTab;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get(ErpUrlQueryParam.TAB) as VinfastPartsStockTab;
      if (
        tabParam === "dashboard" ||
        tabParam === "oto" ||
        tabParam === "xemay"
      ) {
        return tabParam;
      }
    }
    return "dashboard";
  });

  // URL Hydration on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get(ErpUrlQueryParam.TAB) as VinfastPartsStockTab;
    const stockTabParam = params.get(ErpUrlQueryParam.STOCK_TAB);
    const pageParam = params.get(ErpUrlQueryParam.PAGE);
    const sizeParam =
      params.get(ErpUrlQueryParam.PAGE_SIZE) ||
      params.get(ErpUrlQueryParam.LIMIT);
    const detailParam = params.get(ErpUrlQueryParam.DETAIL);

    const targetVehicle: VehicleStockType =
      tabParam === "oto" || tabParam === "xemay" ? tabParam : "oto";
    const hydratedUpdates: Partial<VinfastPartsStockTabState> = {};

    if (
      stockTabParam &&
      ["ALL", "IN_STOCK", "OUT_OF_STOCK", "NEGATIVE", "IN", "OUT"].includes(
        stockTabParam,
      )
    ) {
      hydratedUpdates.stockTab = (
        stockTabParam === "IN"
          ? "IN_STOCK"
          : stockTabParam === "OUT"
            ? "OUT_OF_STOCK"
            : stockTabParam
      ) as VinfastStockTab;
    }
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p)) hydratedUpdates.page = Math.max(1, p);
    }
    if (sizeParam) {
      const s = parseInt(sizeParam, 10);
      if (!isNaN(s)) hydratedUpdates.pageSize = s;
    }
    if (detailParam) {
      hydratedUpdates.selectedSku = detailParam;
    }

    if (Object.keys(hydratedUpdates).length > 0) {
      useVinfastPartsStockStore
        .getState()
        .hydrateFromUrl(targetVehicle, hydratedUpdates);
    }
  }, []);

  const handleTabChange = useCallback((nextTab: string) => {
    if (nextTab === "dashboard" || nextTab === "oto" || nextTab === "xemay") {
      setActiveTab(nextTab as VinfastPartsStockTab);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const newParams = new URLSearchParams(url.search);
        newParams.set(ErpUrlQueryParam.TAB, nextTab);

        if (nextTab === "oto" || nextTab === "xemay") {
          const targetState =
            useVinfastPartsStockStore.getState().states[nextTab];
          if (targetState.stockTab && targetState.stockTab !== "ALL") {
            newParams.set(ErpUrlQueryParam.STOCK_TAB, targetState.stockTab);
          } else {
            newParams.delete(ErpUrlQueryParam.STOCK_TAB);
          }
          if (targetState.page > 1) {
            newParams.set(ErpUrlQueryParam.PAGE, String(targetState.page));
          } else {
            newParams.delete(ErpUrlQueryParam.PAGE);
          }
          if (targetState.selectedSku) {
            newParams.set(ErpUrlQueryParam.DETAIL, targetState.selectedSku);
          } else {
            newParams.delete(ErpUrlQueryParam.DETAIL);
          }
        } else {
          newParams.delete(ErpUrlQueryParam.STOCK_TAB);
          newParams.delete(ErpUrlQueryParam.DETAIL);
          newParams.delete(ErpUrlQueryParam.PAGE);
          newParams.delete(ErpUrlQueryParam.PAGE_SIZE);
        }

        const queryString = newParams.toString();
        const newUrl = `${url.pathname}${queryString ? `?${queryString}` : ""}`;
        window.history.replaceState(null, "", newUrl);
      }
    }
  }, []);

  const tabs = useMemo<TabItem[]>(
    () => [
      {
        value: "dashboard",
        label: t("nav:items.vinfastPartsDashboard", "Tổng quan"),
      },
      {
        value: "oto",
        label: t("nav:items.vinfastPartsOtoStock", "Phụ tùng ôtô"),
      },
      {
        value: "xemay",
        label: t("nav:items.vinfastPartsXemayStock", "Phụ tùng xe máy"),
      },
    ],
    [t],
  );

  // Breadcrumbs sync
  useEffect(() => {
    const tabBreadcrumbMap: Record<VinfastPartsStockTab, string> = {
      dashboard: "nav.items.vinfastPartsDashboard",
      oto: "nav.items.vinfastPartsOtoStock",
      xemay: "nav.items.vinfastPartsXemayStock",
    };
    setCustomBreadcrumbs([
      ["breadcrumb.vinfast"],
      ["nav.items.vinfastPartsGroup"],
      [tabBreadcrumbMap[activeTab] || "nav.items.vinfastPartsDashboard"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [activeTab, setCustomBreadcrumbs]);

  // Popstate sync for top-level tab
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get(ErpUrlQueryParam.TAB) as VinfastPartsStockTab;
      if (
        tabParam &&
        (tabParam === "dashboard" || tabParam === "oto" || tabParam === "xemay")
      ) {
        setActiveTab(tabParam);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // 3-View Lazy Mounted Keep-Alive State (Synchronous render-time marking)
  const mountedViewsRef = useRef<Record<VinfastPartsStockTab, boolean>>({
    dashboard: activeTab === "dashboard",
    oto: activeTab === "oto",
    xemay: activeTab === "xemay",
  });

  if (activeTab) {
    mountedViewsRef.current[activeTab] = true;
  }

  // Kích hoạt Micro-Priority Parallel Prefetch cho các tab còn lại sau 50ms
  useVinfastPartsParallelPrefetch({
    activeTab,
  });

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 w-full overflow-hidden">
      {mountedViewsRef.current.dashboard && (
        <div
          className={
            activeTab === "dashboard"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <VinfastPartsDashboardPage
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      )}

      {mountedViewsRef.current.oto && (
        <div
          className={
            activeTab === "oto"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <VinfastPartsStockTableView
            vehicleType="oto"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      )}

      {mountedViewsRef.current.xemay && (
        <div
          className={
            activeTab === "xemay"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <VinfastPartsStockTableView
            vehicleType="xemay"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      )}
    </div>
  );
}

export const VinfastPartsStockTableView = React.memo(
  function VinfastPartsStockTableView({
    vehicleType,
    tabs,
    activeTab,
    onTabChange,
  }: {
    vehicleType: VehicleStockType;
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (nextTab: string) => void;
  }) {
    const { t } = useTranslation(["vinfastParts", "nav", "common"]);
    const hasVinfastPerm = useHasPermission(
      ErpResource.VINFAST,
      ErpAction.READ,
    );
    const queryClient = useQueryClient();

    // Isolated Zustand state for oto vs xemay
    const tabState = useVinfastPartsStockStore((s) => s.states[vehicleType]);
    const setStockTab = useVinfastPartsStockStore((s) => s.setStockTab);
    const setPage = useVinfastPartsStockStore((s) => s.setPage);
    const setPageSize = useVinfastPartsStockStore((s) => s.setPageSize);
    const setSelectedSku = useVinfastPartsStockStore((s) => s.setSelectedSku);

    const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);

    // Strict state isolation: separate table column states for oto vs xemay
    const tableStateOto = useTableColumnState("vinfast-parts-stock-oto");
    const tableStateXemay = useTableColumnState("vinfast-parts-stock-xemay");
    const tableState = vehicleType === "oto" ? tableStateOto : tableStateXemay;

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
      if (typeof window === "undefined" || activeTab !== vehicleType) return;

      if (debounceUrlTimerRef.current) {
        clearTimeout(debounceUrlTimerRef.current);
      }

      debounceUrlTimerRef.current = setTimeout(() => {
        const currentUrl = new URL(window.location.href);
        const newParams = new URLSearchParams(currentUrl.search);

        // Keep tab
        newParams.set(ErpUrlQueryParam.TAB, vehicleType);

        // Stock PillTab
        if (tabState.stockTab && tabState.stockTab !== "ALL") {
          newParams.set(ErpUrlQueryParam.STOCK_TAB, tabState.stockTab);
        } else {
          newParams.delete(ErpUrlQueryParam.STOCK_TAB);
        }

        // Detail drawer
        if (tabState.selectedSku) {
          newParams.set(ErpUrlQueryParam.DETAIL, tabState.selectedSku);
        } else {
          newParams.delete(ErpUrlQueryParam.DETAIL);
        }

        // Pagination
        if (tabState.page > 1) {
          newParams.set(ErpUrlQueryParam.PAGE, String(tabState.page));
        } else {
          newParams.delete(ErpUrlQueryParam.PAGE);
        }
        if (tabState.pageSize !== getDefaultVinfastPageSize()) {
          newParams.set(ErpUrlQueryParam.PAGE_SIZE, String(tabState.pageSize));
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
      activeTab,
      vehicleType,
      tabState.stockTab,
      tabState.selectedSku,
      tabState.page,
      tabState.pageSize,
      tableState.columnFilters,
      tableState.columnSearch,
      tableState.sorts,
    ]);

    // Handle popstate for 2-way sync
    useEffect(() => {
      const handlePopState = () => {
        const params = new URLSearchParams(window.location.search);
        const detailParam = params.get(ErpUrlQueryParam.DETAIL);
        setSelectedSku(vehicleType, detailParam || null);

        const stockParam = params.get(ErpUrlQueryParam.STOCK_TAB);
        if (
          stockParam &&
          ["ALL", "IN_STOCK", "OUT_OF_STOCK", "NEGATIVE", "IN", "OUT"].includes(
            stockParam,
          )
        ) {
          const normalized = (
            stockParam === "IN"
              ? "IN_STOCK"
              : stockParam === "OUT"
                ? "OUT_OF_STOCK"
                : stockParam
          ) as VinfastStockTab;
          setStockTab(vehicleType, normalized);
        }

        const pageParam = params.get(ErpUrlQueryParam.PAGE);
        if (pageParam) {
          const p = parseInt(pageParam, 10);
          if (!isNaN(p)) setPage(vehicleType, p);
        }
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }, [vehicleType, setSelectedSku, setStockTab, setPage]);

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
            stockTab:
              tabState.stockTab !== "ALL" ? tabState.stockTab : undefined,
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
      [vehicleType, tabState.stockTab],
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
        tabState.stockTab,
        tabState.page,
        tabState.pageSize,
        sortBy,
        sortOrder,
        tableState.columnSearch,
        tableState.columnFilters,
        tableState.sorts,
      ],
      queryFn: async () => {
        const params = new URLSearchParams();
        params.append(ErpUrlQueryParam.VEHICLE_TYPE, vehicleType);

        if (tabState.stockTab && tabState.stockTab !== "ALL") {
          params.append("stockTab", tabState.stockTab);
          params.append("stock_tab", tabState.stockTab);
        }
        if (sortBy) params.append(ErpUrlQueryParam.SORT_BY, sortBy);
        if (sortOrder) params.append(ErpUrlQueryParam.SORT_DIR, sortOrder);
        if (tableState.sorts.length > 0)
          params.append(
            ErpUrlQueryParam.SORTS,
            JSON.stringify(tableState.sorts),
          );
        if (Object.keys(tableState.columnSearch).length > 0)
          params.append(
            "column_search",
            JSON.stringify(tableState.columnSearch),
          );
        if (Object.keys(tableState.columnFilters).length > 0)
          params.append(
            "column_filters",
            JSON.stringify(tableState.columnFilters),
          );

        params.append(ErpUrlQueryParam.PAGE, tabState.page.toString());
        params.append(ErpUrlQueryParam.LIMIT, tabState.pageSize.toString());

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
          header: headerFilter(
            "sku",
            t("vinfastParts:PART_SKU", "Mã phụ tùng"),
          ),
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
                setSelectedSku(vehicleType, row.sku, row);
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
            <div
              className="truncate w-full max-w-[280px]"
              title={row.name || ""}
            >
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
      [headerFilter, t, vehicleType, setSelectedSku],
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
                setSelectedSku(vehicleType, row.sku, row);
              },
            },
          ],
        },
      ],
      [t, vehicleType, setSelectedSku],
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

    const customActionsNode = (
      <div className="w-full sm:w-auto flex items-center flex-wrap gap-2 py-0.5">
        {/* PillTabs: Tất cả | Còn tồn kho | Hết hàng | Tồn âm */}
        <PillTabs
          className="w-full sm:w-auto shrink-0"
          listClassName="h-8 p-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03)]"
          triggerClassName="h-7 px-3 text-xs rounded-full"
          items={[
            { value: "ALL", label: t("vinfastParts:ALL", "Tất cả") },
            {
              value: "IN_STOCK",
              label: t("vinfastParts:IN_STOCK", "Còn tồn kho"),
            },
            {
              value: "OUT_OF_STOCK",
              label: t("vinfastParts:OUT_OF_STOCK", "Hết hàng"),
            },
            {
              value: "NEGATIVE",
              label: t("vinfastParts:NEGATIVE_STOCK", "Tồn âm"),
            },
          ]}
          value={tabState.stockTab}
          onValueChange={(val: string) => {
            setStockTab(vehicleType, val as VinfastStockTab);
          }}
          hideBorder
        />
      </div>
    );

    if (!hasVinfastPerm) {
      return <ComingSoon />;
    }

    return (
      <>
        <SpreadsheetPageTemplate
          tableId={`vinfast-parts-stock-${vehicleType}`}
          title={t("nav:items.vinfastPartsStock", "Tồn kho phụ tùng")}
          desc={t(
            "nav:items.vinfastPartsStockDesc",
            "Sổ cái và tồn kho phụ tùng VinFast",
          )}
          icon={<FileText className="w-5 h-5 text-gray-500" />}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onRefresh={() =>
            queryClient.invalidateQueries({
              queryKey: ["vinfast-parts-stock", vehicleType],
            })
          }
          activeFilterCount={tableState.activeFilterCount}
          onClearAllFilters={() => tableState.resetFilters()}
          customActionsNode={customActionsNode}
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
          page={tabState.page}
          pageSize={tabState.pageSize}
          total={data?.total || 0}
          totalPages={data?.totalPages || 0}
          onPage={(p) => setPage(vehicleType, p)}
          onPageSize={(s) => setPageSize(vehicleType, s)}
          getRowKey={(row: any) => row.sku}
        />

        <VinfastPartsStockDetailDrawer
          open={!!tabState.selectedSku}
          onClose={() => {
            setSelectedSku(vehicleType, null);
          }}
          sku={tabState.selectedSku || ""}
          catalogData={tabState.catalogData}
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
            stockTab:
              tabState.stockTab !== "ALL" ? tabState.stockTab : undefined,
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
  },
);
