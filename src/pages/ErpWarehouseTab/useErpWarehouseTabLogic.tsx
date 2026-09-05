import { useEffect, useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  PackagePlus,
  PackageMinus,
  SlidersHorizontal,
  Trash2,
  XCircle,
  Printer,
  Eye,
  FileSpreadsheet,
  FileText,
  Pencil,
  Settings,
} from "lucide-react";

import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import { useAppStore } from "@/core/config/appStore";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { getDefaultPageSize } from "@/shared/components/DataTable";
import { PillTabs } from "@/shared/components/PillTabs";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import { DEFAULT_DEBOUNCE_TIME } from "@/shared/constants/timing";
import { encodeStateParam, decodeStateParam } from "@/shared/utils/pageUrl";
import {
  useTableColumnState,
  useTableColumnStore,
} from "@/shared/hooks/useTableColumnState";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { useInventoryVoucherDrawer } from "@/modules/inventory-core/hooks/useInventoryVoucherDrawer";
import { useWarehouseVouchersQuery } from "@/modules/inventory-core/hooks/useWarehouseVoucherQueries";
import type { WarehouseRow } from "@/modules/inventory-core/api/warehouseVouchersCoreApi";
import { goodsReceiptsCoreApi } from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";
import { goodsIssuesCoreApi } from "@/modules/goods-issues-core/api/goodsIssuesCoreApi";
import { inventoryAdjustmentsApi } from "@/modules/inventory-adjustments/api/inventoryAdjustmentsApi";
import { WarehouseViewModeCombobox } from "./components/WarehouseViewModeCombobox";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "@/shared/hooks/useUserPreferences";
import {
  WAREHOUSE_COLUMN_VIEW_PRESETS,
  DEFAULT_WAREHOUSE_COLUMN_VISIBILITY,
} from "./utils";
import { toast } from "react-hot-toast";

import { useWarehousePrintExport } from "./hooks/useWarehousePrintExport";
import { useWarehouseColumns } from "./hooks/useWarehouseColumns";

export type WarehouseVoucherTypeTab =
  | "all"
  | "receipt"
  | "issue"
  | "adjustment";

export function useErpWarehouseTabLogic() {
  const t = useT();
  const canReadReceipts = useHasPermission(
    ErpResource.GOODS_RECEIPTS,
    ErpAction.READ,
  );
  const canCreateReceipt = useHasPermission(
    ErpResource.GOODS_RECEIPTS,
    ErpAction.CREATE,
  );
  const canUpdateReceipt = useHasPermission(
    ErpResource.GOODS_RECEIPTS,
    ErpAction.UPDATE,
  );
  const canDeleteReceipt = useHasPermission(
    ErpResource.GOODS_RECEIPTS,
    ErpAction.DELETE,
  );

  const canReadIssues = useHasPermission(
    ErpResource.GOODS_ISSUES,
    ErpAction.READ,
  );
  const canCreateIssue = useHasPermission(
    ErpResource.GOODS_ISSUES,
    ErpAction.CREATE,
  );
  const canUpdateIssue = useHasPermission(
    ErpResource.GOODS_ISSUES,
    ErpAction.UPDATE,
  );
  const canDeleteIssue = useHasPermission(
    ErpResource.GOODS_ISSUES,
    ErpAction.DELETE,
  );

  const canReadAdjustments = useHasPermission(
    ErpResource.INVENTORY_ADJUSTMENTS,
    ErpAction.READ,
  );
  const canCreateAdjustment = useHasPermission(
    ErpResource.INVENTORY_ADJUSTMENTS,
    ErpAction.CREATE,
  );
  const canUpdateAdjustment = useHasPermission(
    ErpResource.INVENTORY_ADJUSTMENTS,
    ErpAction.UPDATE,
  );
  const canDeleteAdjustment = useHasPermission(
    ErpResource.INVENTORY_ADJUSTMENTS,
    ErpAction.DELETE,
  );

  const isAdmin = useHasPermission(ErpResource.SUPER_ADMIN, ErpAction.ALL);
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const [activeTypeTab, setActiveTypeTab] = useState<WarehouseVoucherTypeTab>(
    () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tabParam = (params.get(ErpUrlQueryParam.TAB) ||
          params.get("type")) as WarehouseVoucherTypeTab;
        if (
          tabParam === "all" ||
          tabParam === "receipt" ||
          tabParam === "issue" ||
          tabParam === "adjustment"
        ) {
          return tabParam;
        }
      }
      return "all";
    },
  );

  // Custom Fields Config Drawer state (ModuleCustomFieldConfigDrawer)
  const [customFieldsDrawerOpen, setCustomFieldsDrawerOpen] = useState(false);
  const [customFieldsInitialTab, setCustomFieldsInitialTab] =
    useState<string>("GOODS_RECEIPT");

  const handleOpenCustomFieldsDrawer = useCallback(
    (type?: string) => {
      const normalized = (type || activeTypeTab || "").toLowerCase();
      let targetModule = "GOODS_RECEIPT";
      if (normalized === "issue" || normalized === "goods_issue") {
        targetModule = "GOODS_ISSUE";
      } else if (
        normalized === "adjustment" ||
        normalized === "inventory_adjustment"
      ) {
        targetModule = "INVENTORY_ADJUSTMENT";
      }
      setCustomFieldsInitialTab(targetModule);
      setCustomFieldsDrawerOpen(true);
    },
    [activeTypeTab],
  );

  const [page, setPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get(ErpUrlQueryParam.PAGE);
      if (pageParam) {
        const p = parseInt(pageParam, 10);
        if (!isNaN(p) && p > 0) return p;
      }
    }
    return 1;
  });

  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sizeParam =
        params.get(ErpUrlQueryParam.PAGE_SIZE) ||
        params.get(ErpUrlQueryParam.LIMIT);
      if (sizeParam) {
        const s = parseInt(sizeParam, 10);
        if (!isNaN(s) && s > 0) return s;
      }
    }
    return getDefaultPageSize();
  });

  const [loadError, setLoadError] = useState<string | null>(null);

  const filterConfig: FilterPanelConfig = {
    search: false,
    period: true,
    noDefaultPeriod: true,
  };
  const filterPanel = useFilterPanel(filterConfig);
  const { dateFrom, dateTo } = filterPanel.state;

  // Hydrate dates from URL on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const df = params.get(ErpUrlQueryParam.DATE_FROM);
    const dt = params.get(ErpUrlQueryParam.DATE_TO);
    if (df) filterPanel.setDateFrom(df);
    if (dt) filterPanel.setDateTo(dt);
  }, []);

  const unifiedDrawer = useInventoryVoucherDrawer({
    invalidateWarehouseQuery: true,
  });
  const { grDrawer, giDrawer, iaDrawer } = unifiedDrawer;
  const grCancelId = grDrawer.cancelId;
  const [deleteTarget, setDeleteTarget] = useState<WarehouseRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<WarehouseRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Hydrate drawer from URL on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const detailParam = params.get(ErpUrlQueryParam.DETAIL);
    const drawerParam = params.get(ErpUrlQueryParam.DRAWER) || activeTypeTab;
    if (detailParam) {
      if (
        drawerParam === "receipt" ||
        detailParam.startsWith("NK-") ||
        detailParam.startsWith("GR-")
      ) {
        grDrawer.openDetail(detailParam, false);
      } else if (
        drawerParam === "issue" ||
        detailParam.startsWith("XK-") ||
        detailParam.startsWith("GI-")
      ) {
        giDrawer.openDetail(detailParam, false);
      } else if (
        drawerParam === "adjustment" ||
        detailParam.startsWith("KK-") ||
        detailParam.startsWith("IA-")
      ) {
        iaDrawer.openDetail(detailParam, false);
      } else {
        grDrawer.openDetail(detailParam, false);
      }
    }
  }, []);

  const tableId = "inventory-vouchers-table";
  const tableState = useTableColumnState(tableId);

  const [activeColumnPresetKey, setActiveColumnPresetKey] = useState<string>(
    () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const vmParam = params.get(ErpUrlQueryParam.VIEW_MODE);
        if (vmParam) return vmParam;
      }
      return "overview";
    },
  );

  const [viewConfigDrawerOpen, setViewConfigDrawerOpen] = useState(false);
  const [editingViewPreset, setEditingViewPreset] =
    useState<TableViewPreset | null>(null);

  const handleColumnPresetChange = useCallback(
    (preset: TableViewPreset) => {
      setActiveColumnPresetKey(preset.key);
      if (preset.columnVisibility) {
        const store = useUserPreferencesStore.getState();
        const current = store.getTablePreference(tableId);
        store.setTablePreferences(tableId, {
          columnOrder: current?.columnOrder || [],
          columnVisibility: preset.columnVisibility as any,
          columnSizing: current?.columnSizing,
          activeView: preset.key,
          views: current?.views,
        });
      }
    },
    [tableId],
  );

  const columnViewPresetsHook = usePageViewPresets({
    tableId,
    defaultPresets: WAREHOUSE_COLUMN_VIEW_PRESETS,
    activeView: activeColumnPresetKey,
    onViewChange: handleColumnPresetChange,
  });

  const currentColumnVisibility =
    useUserPreferencesStore.getState().getTablePreference(tableId)
      ?.columnVisibility || DEFAULT_WAREHOUSE_COLUMN_VISIBILITY;

  const handleOpenCreateView = useCallback(() => {
    setEditingViewPreset(null);
    setViewConfigDrawerOpen(true);
  }, []);

  const handleOpenEditView = useCallback((preset: TableViewPreset) => {
    setEditingViewPreset(preset);
    setViewConfigDrawerOpen(true);
  }, []);

  const handleSaveViewPreset = useCallback(
    (data: {
      key?: string;
      label: string;
      columnVisibility: Record<string, boolean>;
    }) => {
      const isDefault = data.key === "overview" || data.key === "audit";
      if (data.key) {
        const updatedPreset: TableViewPreset = {
          key: data.key,
          label: data.label,
          filters: {},
          columnVisibility: data.columnVisibility,
          isDefault,
          isCustom: !isDefault,
          isModified: isDefault,
        };
        useUserPreferencesStore
          .getState()
          .saveTableViewPreset(tableId, updatedPreset);
        handleColumnPresetChange(updatedPreset);
        toast.success(t("viewModeSaveSuccess", "Đã lưu chế độ xem thành công"));
      } else {
        const newKey = `custom_${Date.now()}`;
        const newPreset: TableViewPreset = {
          key: newKey,
          label: data.label,
          filters: {},
          columnVisibility: data.columnVisibility,
          isDefault: false,
          isCustom: true,
        };
        useUserPreferencesStore
          .getState()
          .saveTableViewPreset(tableId, newPreset);
        handleColumnPresetChange(newPreset);
        toast.success(t("viewModeSaveSuccess", "Đã lưu chế độ xem thành công"));
      }
    },
    [tableId, handleColumnPresetChange, t],
  );

  const handleResetViewPreset = useCallback(
    (key: string) => {
      columnViewPresetsHook.resetView(key);
      const factoryPreset = WAREHOUSE_COLUMN_VIEW_PRESETS.find(
        (p) => p.key === key,
      );
      if (factoryPreset) {
        handleColumnPresetChange(factoryPreset);
      }
      toast.success(
        t(
          "viewModeResetSuccess",
          "Đã khôi phục chế độ xem về mặc định thành công",
        ),
      );
    },
    [columnViewPresetsHook, handleColumnPresetChange, t],
  );

  const handleDeleteViewPreset = useCallback(
    (key: string) => {
      if (key === "overview" || key === "audit") return;
      columnViewPresetsHook.deleteView(key);
      if (activeColumnPresetKey === key) {
        const fallbackPreset = WAREHOUSE_COLUMN_VIEW_PRESETS[0];
        handleColumnPresetChange(fallbackPreset);
      }
      toast.success(t("viewModeDeleteSuccess", "Đã xóa chế độ xem thành công"));
    },
    [activeColumnPresetKey, columnViewPresetsHook, handleColumnPresetChange, t],
  );

  const debounceUrlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const syncUrlToBrowser = useCallback(() => {
    if (typeof window === "undefined") return;
    const newParams = new URLSearchParams();

    // 1. Tab
    if (activeTypeTab && activeTypeTab !== "all") {
      newParams.set(ErpUrlQueryParam.TAB, activeTypeTab);
    }

    // 2. Date range
    if (dateFrom) newParams.set(ErpUrlQueryParam.DATE_FROM, dateFrom);
    if (dateTo) newParams.set(ErpUrlQueryParam.DATE_TO, dateTo);

    // 3. Pagination
    if (page > 1) newParams.set(ErpUrlQueryParam.PAGE, String(page));
    if (pageSize) {
      newParams.set(ErpUrlQueryParam.PAGE_SIZE, String(pageSize));
    }

    // 4. Column filters & Search
    if (Object.keys(tableState.columnFilters).length > 0) {
      const encoded = encodeStateParam(tableState.columnFilters);
      if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_FILTERS, encoded);
    }

    if (Object.keys(tableState.columnSearch).length > 0) {
      const encoded = encodeStateParam(tableState.columnSearch);
      if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_SEARCH, encoded);
    }

    // 5. Sorts
    if (tableState.sorts.length > 0) {
      const encoded = encodeStateParam(tableState.sorts);
      if (encoded) newParams.set(ErpUrlQueryParam.SORTS, encoded);
    }

    // 6. Detail Drawer
    if (grDrawer.open && grDrawer.editing) {
      const detailKey = grDrawer.editing.receiptNo || grDrawer.editing.id;
      if (detailKey) {
        newParams.set(ErpUrlQueryParam.DETAIL, detailKey);
        newParams.set(ErpUrlQueryParam.DRAWER, "receipt");
      }
    } else if (giDrawer.open && giDrawer.editing) {
      const detailKey = giDrawer.editing.issueNo || giDrawer.editing.id;
      if (detailKey) {
        newParams.set(ErpUrlQueryParam.DETAIL, detailKey);
        newParams.set(ErpUrlQueryParam.DRAWER, "issue");
      }
    } else if (iaDrawer.open && iaDrawer.editing) {
      const detailKey = iaDrawer.editing.adjustmentNo || iaDrawer.editing.id;
      if (detailKey) {
        newParams.set(ErpUrlQueryParam.DETAIL, detailKey);
        newParams.set(ErpUrlQueryParam.DRAWER, "adjustment");
      }
    }

    // 7. View Mode
    if (activeColumnPresetKey && activeColumnPresetKey !== "overview") {
      newParams.set(ErpUrlQueryParam.VIEW_MODE, activeColumnPresetKey);
    }

    const newSearch = newParams.toString();
    const newRelativePath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`;
    if (window.location.pathname + window.location.search !== newRelativePath) {
      window.history.replaceState(null, "", newRelativePath);
      useAppStore
        .getState()
        .updateCurrentTabUrl("erp-inventory-vouchers", newRelativePath);
    }
  }, [
    activeTypeTab,
    activeColumnPresetKey,
    dateFrom,
    dateTo,
    page,
    pageSize,
    tableState.columnFilters,
    tableState.columnSearch,
    tableState.sorts,
    grDrawer.open,
    grDrawer.editing,
    giDrawer.open,
    giDrawer.editing,
    iaDrawer.open,
    iaDrawer.editing,
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

  // URL Hydration on popstate (Back/Forward)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = (params.get(ErpUrlQueryParam.TAB) ||
        params.get("type")) as WarehouseVoucherTypeTab;
      if (
        tabParam === "all" ||
        tabParam === "receipt" ||
        tabParam === "issue" ||
        tabParam === "adjustment"
      ) {
        setActiveTypeTab(tabParam);
      } else {
        setActiveTypeTab("all");
      }

      // View Mode
      const vmParam = params.get(ErpUrlQueryParam.VIEW_MODE);
      const targetViewMode = vmParam || "overview";
      setActiveColumnPresetKey(targetViewMode);

      // Dates
      const df = params.get(ErpUrlQueryParam.DATE_FROM);
      const dt = params.get(ErpUrlQueryParam.DATE_TO);
      if (df !== null) filterPanel.setDateFrom(df);
      if (dt !== null) filterPanel.setDateTo(dt);

      // Pagination
      const pageParam = params.get(ErpUrlQueryParam.PAGE);
      if (pageParam) {
        const p = parseInt(pageParam, 10);
        if (!isNaN(p)) setPage(p);
      } else {
        setPage(1);
      }

      const sizeParam =
        params.get(ErpUrlQueryParam.PAGE_SIZE) ||
        params.get(ErpUrlQueryParam.LIMIT);
      if (sizeParam) {
        const s = parseInt(sizeParam, 10);
        if (!isNaN(s)) setPageSize(s);
      }

      // Column Filters, Search, Sorts
      const cfParam = params.get(ErpUrlQueryParam.COLUMN_FILTERS);
      if (cfParam) {
        const decoded = decodeStateParam<Record<string, string[]>>(cfParam);
        if (decoded) {
          Object.entries(decoded).forEach(([col, vals]) => {
            useTableColumnStore
              .getState()
              .setColumnFilter(
                "inventory-vouchers-table",
                col,
                Array.isArray(vals) ? vals : [String(vals)],
              );
          });
        }
      }

      const csParam = params.get(ErpUrlQueryParam.COLUMN_SEARCH);
      if (csParam) {
        const decoded = decodeStateParam<Record<string, string>>(csParam);
        if (decoded) {
          Object.entries(decoded).forEach(([col, val]) => {
            useTableColumnStore
              .getState()
              .setColumnSearch("inventory-vouchers-table", col, String(val));
          });
        }
      }

      const sortsParam = params.get(ErpUrlQueryParam.SORTS);
      if (sortsParam) {
        const decoded = decodeStateParam<string[]>(sortsParam);
        if (Array.isArray(decoded)) {
          decoded.forEach((s) => {
            const isDesc = s.startsWith("-");
            const field = isDesc ? s.substring(1) : s;
            useTableColumnStore
              .getState()
              .setSort(
                "inventory-vouchers-table",
                field,
                isDesc ? "desc" : "asc",
              );
          });
        }
      }

      // Drawer
      const detailParam = params.get(ErpUrlQueryParam.DETAIL);
      const drawerParam = params.get(ErpUrlQueryParam.DRAWER) || tabParam;
      if (detailParam) {
        if (
          drawerParam === "receipt" ||
          detailParam.startsWith("NK-") ||
          detailParam.startsWith("GR-")
        ) {
          grDrawer.openDetail(detailParam, false);
        } else if (
          drawerParam === "issue" ||
          detailParam.startsWith("XK-") ||
          detailParam.startsWith("GI-")
        ) {
          giDrawer.openDetail(detailParam, false);
        } else if (
          drawerParam === "adjustment" ||
          detailParam.startsWith("KK-") ||
          detailParam.startsWith("IA-")
        ) {
          iaDrawer.openDetail(detailParam, false);
        }
      } else {
        if (grDrawer.open) grDrawer.close();
        if (giDrawer.open) giDrawer.close();
        if (iaDrawer.open) iaDrawer.close();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [filterPanel, grDrawer, giDrawer, iaDrawer, tableId]);

  const handleTypeTabChange = useCallback(
    (nextTab: WarehouseVoucherTypeTab) => {
      setActiveTypeTab(nextTab);
      setPage(1);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (nextTab && nextTab !== "all") {
          url.searchParams.set(ErpUrlQueryParam.TAB, nextTab);
        } else {
          url.searchParams.delete(ErpUrlQueryParam.TAB);
        }
        url.searchParams.delete("type");
        window.history.replaceState(null, "", url.toString());
        useAppStore
          .getState()
          .updateCurrentTabUrl("erp-inventory-vouchers", url.toString());
      }
    },
    [],
  );

  const handleClearAllFilters = useCallback(() => {
    tableState.resetFilters();
    filterPanel.resetAll();
    setPage(1);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const tabParam = url.searchParams.get(ErpUrlQueryParam.TAB);
      const newParams = new URLSearchParams();
      if (tabParam && tabParam !== "all") {
        newParams.set(ErpUrlQueryParam.TAB, tabParam);
      }
      const newRelativePath = `${window.location.pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`;
      window.history.replaceState(null, "", newRelativePath);
      useAppStore
        .getState()
        .updateCurrentTabUrl("erp-inventory-vouchers", newRelativePath);
    }
  }, [tableState, filterPanel]);

  const customActionsNode = (
    <div className="w-full sm:w-auto flex items-center flex-wrap gap-2 py-0.5">
      <PillTabs<WarehouseVoucherTypeTab>
        className="w-full sm:w-auto shrink-0"
        listClassName="h-8 p-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03)]"
        triggerClassName="h-7 px-3 text-xs rounded-full"
        items={[
          { value: "all", label: t("common.all", "Tất cả") },
          {
            value: "receipt",
            label: t("inventory.receiptVoucher", "Nhập kho"),
          },
          {
            value: "issue",
            label: t("inventory.issueVoucher", "Xuất kho"),
          },
          {
            value: "adjustment",
            label: t("inventory.adjustmentVoucher", "Điều chỉnh"),
          },
        ]}
        value={activeTypeTab}
        onValueChange={handleTypeTabChange}
        hideBorder
      />

      <div className="hidden sm:block h-4 w-px bg-slate-300/80 dark:bg-slate-700/80 shrink-0" />

      <WarehouseViewModeCombobox
        presets={columnViewPresetsHook.presets}
        activePresetKey={activeColumnPresetKey}
        onSelect={handleColumnPresetChange}
        onCreateView={handleOpenCreateView}
        onEditView={handleOpenEditView}
        onDeleteView={handleDeleteViewPreset}
      />
    </div>
  );

  const printExport = useWarehousePrintExport();
  const {
    companyProfile,
    printGrRef,
    printGiRef,
    printGrData,
    printGiData,
    printTargetId,
    xlsxExportingId,
    handlePrintRow,
    handleExportXlsx,
  } = printExport;

  const vouchersQuery = useWarehouseVouchersQuery({
    page,
    pageSize,
    search: undefined,
    type: activeTypeTab === "all" ? undefined : activeTypeTab,
    dateFrom,
    dateTo,
    status: undefined,
    partnerId: undefined,
    sort: tableState.sorts.length > 0 ? tableState.sorts : undefined,
    column_search:
      Object.keys(tableState.columnSearch).length > 0
        ? JSON.stringify(tableState.columnSearch)
        : undefined,
    column_filters:
      Object.keys(tableState.columnFilters).length > 0
        ? JSON.stringify(tableState.columnFilters)
        : undefined,
  });

  useEffect(() => {
    const error =
      vouchersQuery.error instanceof Error ? vouchersQuery.error.message : null;
    setLoadError(error);
  }, [vouchersQuery.error]);

  useEffect(() => {
    const grPrefill = window.sessionStorage.getItem("gr_prefill_mo");
    if (grPrefill) {
      window.sessionStorage.removeItem("gr_prefill_mo");
      grDrawer.openCreate(undefined, grPrefill);
    }
    const giPrefill = window.sessionStorage.getItem("gi_prefill_mo");
    if (giPrefill) {
      window.sessionStorage.removeItem("gi_prefill_mo");
      giDrawer.openCreate(giPrefill);
    }
  }, [grDrawer, giDrawer]);

  const rows: WarehouseRow[] = vouchersQuery.data?.items ?? [];
  const loading = vouchersQuery.isLoading || vouchersQuery.isFetching;
  const total = vouchersQuery.data?.total ?? 0;
  const totalPages = vouchersQuery.data?.totalPages ?? 1;

  const { columns, summaryRow } = useWarehouseColumns({
    tableState,
    dateFrom,
    dateTo,
    setDateRange: (from?: string, to?: string) => {
      filterPanel.setDateFrom(from || "");
      filterPanel.setDateTo(to || "");
      setPage(1);
    },
    setPage,
    unifiedDrawer,
    rows,
  });

  async function handleGrCancel(id: string) {
    if (cancelTarget?.type === "adjustment") {
      await iaDrawer.handleCancel(id);
    } else {
      await grDrawer.handleCancel(id);
    }
    setCancelTarget(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "receipt") {
        await goodsReceiptsCoreApi.remove(deleteTarget.id);
        showToast({
          title: t(
            "inventory.toastDeleteReceiptSuccess",
            "Đã xóa phiếu nhập kho",
          ),
          variant: "success",
        });
      } else if (deleteTarget.type === "issue") {
        await goodsIssuesCoreApi.remove(deleteTarget.id);
        showToast({
          title: t(
            "inventory.toastDeleteIssueSuccess",
            "Đã xóa phiếu xuất kho",
          ),
          variant: "success",
        });
      } else if (deleteTarget.type === "adjustment") {
        await inventoryAdjustmentsApi.delete(deleteTarget.id);
        showToast({
          title: t(
            "inventory.toastDeleteAdjustmentSuccess",
            "Đã xóa phiếu điều chỉnh",
          ),
          variant: "success",
        });
      }
      await queryClient.invalidateQueries({
        queryKey: ["warehouse-vouchers", "unified"],
      });
      setDeleteTarget(null);
    } catch (e) {
      showToast({
        title:
          e instanceof Error
            ? e.message
            : t("inventory.toastDeleteError", "Lỗi xóa phiếu"),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  const rowActions = (row: WarehouseRow) => [
    {
      groupLabel: t("common.groupSearch", "Tra cứu"),
      items: [
        {
          label: t("common.detail", "Chi tiết"),
          icon: <Eye className="h-3.5 w-3.5" />,
          onClick: () => {
            if (row.type === "receipt") {
              grDrawer.openDetail(row.id);
            } else if (row.type === "issue") {
              giDrawer.openDetail(row.id);
            } else if (row.type === "adjustment") {
              iaDrawer.openDetail(row.id);
            }
          },
        },
        ...(row.poNo || row.purchaseOrderId || row.salesOrderId
          ? [
              {
                label:
                  row.type === "receipt" || row.purchaseOrderId
                    ? t("purchasing.viewPo", "Xem đơn mua hàng")
                    : t("sales.viewSo", "Xem đơn bán hàng"),
                icon: <FileText className="h-3.5 w-3.5" />,
                onClick: () => {
                  if (row.purchaseOrderId || row.type === "receipt") {
                    window.dispatchEvent(
                      new CustomEvent("open_erp_document", {
                        detail: {
                          type: "erp_purchase_order",
                          id: row.purchaseOrderId || row.poNo,
                        },
                      }),
                    );
                  } else if (row.salesOrderId || row.type === "issue") {
                    window.dispatchEvent(
                      new CustomEvent("open_erp_document", {
                        detail: {
                          type: "erp_sales_order",
                          id: row.salesOrderId || row.poNo,
                        },
                      }),
                    );
                  }
                },
              },
            ]
          : []),
      ],
    },
    {
      groupLabel: t("common.groupActions", "Thao tác"),
      items: [
        {
          label: t("common.edit", "Chỉnh sửa"),
          icon: <Pencil className="h-3.5 w-3.5" />,
          hidden:
            row.status === "CANCELLED" ||
            (row.type === "receipt" && !canUpdateReceipt) ||
            (row.type === "issue" && !canUpdateIssue) ||
            (row.type === "adjustment" && !canUpdateAdjustment),
          onClick: () => {
            if (row.type === "receipt") {
              grDrawer.openDetail(row.id, false);
            } else if (row.type === "issue") {
              giDrawer.openDetail(row.id, false);
            } else if (row.type === "adjustment") {
              iaDrawer.openDetail(row.id, false);
            }
          },
        },
        {
          label: t("common.print", "In"),
          icon: <Printer className="h-3.5 w-3.5" />,
          hidden: row.status === "DRAFT" || !isAdmin,
          disabled: !!printTargetId,
          onClick: () => handlePrintRow(row),
        },
        {
          label: t("inventory.warehouseConfig", "Cấu hình kho"),
          icon: <Settings className="h-3.5 w-3.5 text-muted-foreground" />,
          onClick: () => {
            handleOpenCustomFieldsDrawer(row.type);
          },
        },
        {
          label: t("common.exportXlsx", "Xuất XLSX"),
          icon: (
            <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
          ),
          hidden: row.status === "DRAFT" || row.type === "adjustment",
          disabled: xlsxExportingId === row.id,
          onClick: () => handleExportXlsx(row),
        },
        {
          label: t("common.delete", "Xóa"),
          icon: <Trash2 className="h-3.5 w-3.5" />,
          variant: "danger" as const,
          hidden:
            row.status !== "DRAFT" ||
            (row.type === "receipt" && !canDeleteReceipt) ||
            (row.type === "issue" && !canDeleteIssue) ||
            (row.type === "adjustment" && !canDeleteAdjustment),
          onClick: () => {
            setDeleteTarget(row);
          },
        },
        {
          label: t("inventory.cancelVoucher", "Hủy phiếu"),
          icon: <XCircle className="h-3.5 w-3.5" />,
          variant: "danger" as const,
          hidden:
            row.status !== "POSTED" ||
            (row.type === "receipt" && !canUpdateReceipt) ||
            (row.type === "issue" && !canUpdateIssue) ||
            (row.type === "adjustment" && !canUpdateAdjustment),
          onClick: () => {
            setCancelTarget(row);
          },
        },
      ],
    },
  ];

  const createActions = [
    {
      groupLabel: t("common.groupAddNew", "Thêm mới"),
      items: [
        {
          label: t("inventory.receipt", "Nhập kho"),
          icon: <PackagePlus className="h-4 w-4 text-muted-foreground" />,
          onClick: () => grDrawer.openCreate(),
          hidden: !canCreateReceipt,
        },
        {
          label: t("inventory.issue", "Xuất kho"),
          icon: <PackageMinus className="h-4 w-4 text-muted-foreground" />,
          onClick: () => giDrawer.openCreate(),
          hidden: !canCreateIssue,
        },
        {
          label: t("inventory.adjustment", "Điều chỉnh kho"),
          icon: <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />,
          onClick: () => iaDrawer.openCreate(),
          hidden: !canCreateAdjustment,
        },
      ],
    },
    {
      groupLabel: t("common.groupConfig", "Cấu hình"),
      items: [
        {
          label: t("inventory.warehouseConfig", "Cấu hình kho"),
          icon: <Settings className="h-4 w-4 text-muted-foreground" />,
          onClick: () => handleOpenCustomFieldsDrawer(),
        },
      ],
    },
  ];

  return {
    t,
    canReadReceipts,
    canReadIssues,
    canReadAdjustments,
    page,
    setPage,
    pageSize,
    setPageSize,
    loadError,
    rows,
    columns,
    summaryRow,
    loading,
    total,
    totalPages,
    tableState,
    unifiedDrawer,
    deleteTarget,
    setDeleteTarget,
    deleting,
    handleDeleteConfirm,
    cancelTarget,
    setCancelTarget,
    grCancelId,
    handleGrCancel,
    printGrRef,
    printGiRef,
    companyProfile,
    printGrData,
    printGiData,
    rowActions,
    createActions,
    vouchersQuery,
    activeTypeTab,
    handleTypeTabChange,
    handleClearAllFilters,
    filterPanel,
    customActionsNode,
    viewConfigDrawerOpen,
    setViewConfigDrawerOpen,
    editingViewPreset,
    handleSaveViewPreset,
    handleResetViewPreset,
    activeColumnPresetKey,
    columnViewPresetsHook,
    currentColumnVisibility,
    customFieldsDrawerOpen,
    setCustomFieldsDrawerOpen,
    customFieldsInitialTab,
    handleOpenCustomFieldsDrawer,
  };
}
