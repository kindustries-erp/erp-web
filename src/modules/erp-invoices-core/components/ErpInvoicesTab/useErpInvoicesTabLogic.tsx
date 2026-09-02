import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { useAppStore } from "@/core/config/appStore";
import {
  erpInvoicesCoreApi,
  type ErpInvoiceListParams,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { ErpQueryKey, DEFAULT_STALE_TIME } from "@/shared/lib/queryKeys";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { useInvoiceSyncProgress } from "@/modules/erp-invoices-core/hooks/useInvoiceSyncProgress";
import { useErpInvoiceUrlSync } from "@/modules/erp-invoices-core/hooks/useErpInvoiceUrlSync";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "@/shared/hooks/useUserPreferences";
import { useTableColumnStore } from "@/shared/hooks/useTableColumnState";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import {
  INVOICE_COLUMN_VIEW_PRESETS,
  DEFAULT_INVOICE_COLUMN_VISIBILITY,
} from "./utils";
import { useInvoiceModals } from "./hooks/useInvoiceModals";
import { useInvoiceBulkActions } from "./hooks/useInvoiceBulkActions";
import {
  useErpInvoiceListStore,
  type Direction,
} from "@/modules/erp-invoices-core/hooks/useErpInvoiceListStore";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import { DEFAULT_DEBOUNCE_TIME } from "@/shared/constants/timing";
import { encodeStateParam } from "@/shared/utils/pageUrl";
import { useErpInvoicesParallelPrefetch } from "@/modules/erp-invoices-core/hooks/useErpInvoicesParallelPrefetch";

export interface ErpInvoicesTabProps {
  direction?: "IN" | "OUT";
  initialDateFrom?: string;
  initialDateTo?: string;
  isDrawer?: boolean;
  instanceIndex?: 1 | 2;
  partnerTaxCode?: string;
}

export function useErpInvoicesTabLogic({
  direction: propDirection,
  isDrawer = false,
  instanceIndex = 1,
  partnerTaxCode,
}: ErpInvoicesTabProps) {
  const { t } = useTranslation("erpInvoices");
  const canEditInvoice = useHasPermission(
    ErpResource.INVOICES,
    ErpAction.UPDATE,
  );

  const getInitialTabInfo = () => {
    if (isDrawer) {
      const dir = propDirection || "IN";
      return {
        dir,
        view: "header" as const,
        tabKey: dir === "IN" ? "in" : "out",
      };
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") || "";
      const viewParam = params.get("view") || "";

      if (
        tabParam === "out-lines" ||
        (tabParam === "out" && viewParam === "lines")
      ) {
        return {
          dir: "OUT" as const,
          view: "lines" as const,
          tabKey: "out-lines",
        };
      }
      if (tabParam === "out") {
        return {
          dir: "OUT" as const,
          view: "header" as const,
          tabKey: "out",
        };
      }
      if (
        tabParam === "in-lines" ||
        tabParam === "lines" ||
        viewParam === "lines"
      ) {
        return {
          dir: "IN" as const,
          view: "lines" as const,
          tabKey: "in-lines",
        };
      }
      if (tabParam === "in" || tabParam === "header") {
        return {
          dir: "IN" as const,
          view: "header" as const,
          tabKey: "in",
        };
      }
    }
    const dir = propDirection || "IN";
    return {
      dir,
      view: "header" as const,
      tabKey: dir === "IN" ? "in" : "out",
    };
  };

  const initialTabInfo = getInitialTabInfo();
  const [currentDirection, setCurrentDirection] = useState<"IN" | "OUT">(
    initialTabInfo.dir,
  );
  const [activeView, setActiveView] = useState<"header" | "lines">(
    initialTabInfo.view,
  );
  const [currentTabKey, setCurrentTabKey] = useState<string>(
    initialTabInfo.tabKey,
  );
  const [activeColumnPresetKey, setActiveColumnPresetKey] = useState<string>(
    () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const vmParam = urlParams.get("view_mode");
        if (vmParam) return vmParam;
      }
      const targetStoreDir =
        instanceIndex === 2
          ? initialTabInfo.dir === "IN"
            ? "IN_2"
            : "OUT_2"
          : initialTabInfo.dir;
      const targetTableId = isDrawer
        ? `erp-invoices-table-checkpoint-${initialTabInfo.dir}`
        : `erp-invoices-table-${targetStoreDir}`;
      const stored = useUserPreferencesStore
        .getState()
        .getTablePreference(targetTableId);
      return stored?.activeView || "overview";
    },
  );

  // Kích hoạt Micro-Priority Parallel Prefetch cho các tab còn lại sau 50ms
  useErpInvoicesParallelPrefetch({
    activeTabKey: currentTabKey,
    instanceIndex,
    partnerTaxCode,
    isDrawer,
  });

  useEffect(() => {
    if (isDrawer) {
      if (propDirection && propDirection !== currentDirection) {
        setCurrentDirection(propDirection);
      }
      return;
    }

    // Đảm bảo URL luôn có query param tab khi khởi tạo (kể cả tab đầu tiên ?tab=in)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let shouldUpdate = false;
      if (!url.searchParams.has(ErpUrlQueryParam.TAB)) {
        url.searchParams.set(ErpUrlQueryParam.TAB, initialTabInfo.tabKey);
        shouldUpdate = true;
      }
      const vmFromUrl = url.searchParams.get(ErpUrlQueryParam.VIEW_MODE);
      if (vmFromUrl) {
        const targetStoreDir: Direction =
          instanceIndex === 2
            ? initialTabInfo.dir === "IN"
              ? "IN_2"
              : "OUT_2"
            : initialTabInfo.dir;
        const targetTableId = isDrawer
          ? `erp-invoices-table-checkpoint-${initialTabInfo.dir}`
          : `erp-invoices-table-${targetStoreDir}`;
        const currentPref = useUserPreferencesStore
          .getState()
          .getTablePreference(targetTableId) || {
          columnOrder: [],
          columnVisibility: {},
        };
        useUserPreferencesStore.getState().setTablePreferences(targetTableId, {
          ...currentPref,
          activeView: vmFromUrl,
        });
        setActiveColumnPresetKey(vmFromUrl);
      }
      if (shouldUpdate) {
        const fullUrl = url.toString();
        window.history.replaceState(null, "", fullUrl);
        const currentInstanceId =
          instanceIndex === 2 ? "erp-invoices__2" : "erp-invoices";
        useAppStore.getState().updateCurrentTabUrl(currentInstanceId, fullUrl);
      }
    }

    const handlePopState = () => {
      const info = getInitialTabInfo();
      setCurrentTabKey(info.tabKey);
      setCurrentDirection(info.dir);
      setActiveView(info.view);

      const targetStoreDir: Direction =
        instanceIndex === 2 ? (info.dir === "IN" ? "IN_2" : "OUT_2") : info.dir;
      const targetTableId = isDrawer
        ? `erp-invoices-table-checkpoint-${info.dir}`
        : `erp-invoices-table-${targetStoreDir}`;
      const params = new URLSearchParams(window.location.search);
      const vmParam = params.get("view_mode");
      const targetViewMode =
        vmParam ||
        useUserPreferencesStore.getState().getTablePreference(targetTableId)
          ?.activeView ||
        "overview";
      setActiveColumnPresetKey(targetViewMode);

      const taxTabParam = params.get("tax_tab");
      if (taxTabParam) {
        useErpInvoiceListStore
          .getState()
          .setActiveTaxTab(targetStoreDir, taxTabParam);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDrawer, propDirection, instanceIndex]);

  const queryClient = useQueryClient();
  const loadInvoices = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [ErpQueryKey.INVOICES_LIST],
    });
  }, [queryClient]);

  const formHook = useErpInvoiceForm(loadInvoices);

  const direction = currentDirection;

  const listDir: Direction = isDrawer
    ? direction === "IN"
      ? "CHECKPOINT_IN"
      : "CHECKPOINT_OUT"
    : instanceIndex === 2
      ? direction === "IN"
        ? "IN_2"
        : "OUT_2"
      : direction;

  const actualTableId = isDrawer
    ? `erp-invoices-table-checkpoint-${direction}`
    : `erp-invoices-table-${listDir}`;

  const invoices = useMemo(() => {
    const queries = queryClient.getQueriesData<any>({
      queryKey: [ErpQueryKey.INVOICES_LIST, listDir],
    });
    for (const [, queryData] of queries) {
      if (queryData?.items && Array.isArray(queryData.items)) {
        return queryData.items;
      }
    }
    return [];
  }, [queryClient, listDir]);

  const urlSync = useErpInvoiceUrlSync({
    direction,
    instanceIndex,
    openDrawer: (id) => {
      formHook.openInternal(id);
    },
    closeDrawer: () => {
      formHook.closeDrawer();
    },
    onHydrate: (state) => {
      const urlParams =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;
      const tabParam = urlParams?.get(ErpUrlQueryParam.TAB) || "in";
      const isHeaderTab = tabParam === "in" || tabParam === "out";

      const taxTabFromUrl =
        urlParams?.get(ErpUrlQueryParam.TAX_TAB) ||
        (state.view &&
        ["all", "new", "replacement", "adjustment"].includes(state.view)
          ? state.view
          : null);

      if (isHeaderTab && taxTabFromUrl) {
        useErpInvoiceListStore
          .getState()
          .setActiveTaxTab(listDir, taxTabFromUrl);
      }

      const vmFromUrl = urlParams?.get(ErpUrlQueryParam.VIEW_MODE);
      if (isHeaderTab && vmFromUrl) {
        setActiveColumnPresetKey(vmFromUrl);
      }

      if (state.sorts && state.sorts.length > 0) {
        const field = state.sorts[0].replace("-", "");
        const sortOrder = state.sorts[0].startsWith("-") ? "desc" : "asc";
        useTableColumnStore.getState().setSort(actualTableId, field, sortOrder);
      }
    },
  });

  const debounceUrlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const handleTabChange = useCallback(
    (newTab: string) => {
      if (debounceUrlTimerRef.current) {
        clearTimeout(debounceUrlTimerRef.current);
      }

      let nextDir: "IN" | "OUT";
      let nextView: "header" | "lines";

      if (newTab === "in-lines") {
        nextDir = "IN";
        nextView = "lines";
      } else if (newTab === "out") {
        nextDir = "OUT";
        nextView = "header";
      } else if (newTab === "out-lines") {
        nextDir = "OUT";
        nextView = "lines";
      } else {
        nextDir = "IN";
        nextView = "header";
      }

      // 1. Cập nhật Tab highlight, Direction & View NGAY LẬP TỨC (0ms Synchronous update)
      setCurrentTabKey(newTab);
      setCurrentDirection(nextDir);
      setActiveView(nextView);

      if (!isDrawer && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const currentDetail = url.searchParams.get(ErpUrlQueryParam.DETAIL);
        const currentDmode = url.searchParams.get(ErpUrlQueryParam.DRAWER_MODE);
        const currentI = url.searchParams.get(ErpUrlQueryParam.INSTANCE_INDEX);

        const newParams = new URLSearchParams();
        newParams.set(ErpUrlQueryParam.TAB, newTab);
        if (currentI) {
          newParams.set(ErpUrlQueryParam.INSTANCE_INDEX, currentI);
        }
        if (currentDetail) {
          newParams.set(ErpUrlQueryParam.DETAIL, currentDetail);
        }
        if (currentDmode) {
          newParams.set(ErpUrlQueryParam.DRAWER_MODE, currentDmode);
        }

        const targetStoreDir: Direction =
          instanceIndex === 2 ? (nextDir === "IN" ? "IN_2" : "OUT_2") : nextDir;

        if (nextView === "header") {
          const headerState =
            useErpInvoiceListStore.getState().states[targetStoreDir];
          if (headerState?.activeTaxTab && headerState.activeTaxTab !== "all") {
            newParams.set(ErpUrlQueryParam.TAX_TAB, headerState.activeTaxTab);
          }

          const targetTableId = isDrawer
            ? `erp-invoices-table-checkpoint-${nextDir}`
            : `erp-invoices-table-${targetStoreDir}`;
          const targetTablePref = useUserPreferencesStore
            .getState()
            .getTablePreference(targetTableId);
          const targetViewMode = targetTablePref?.activeView || "overview";
          if (targetViewMode && targetViewMode !== "overview") {
            newParams.set(ErpUrlQueryParam.VIEW_MODE, targetViewMode);
          }
          setActiveColumnPresetKey(targetViewMode);
        }

        const queryString = newParams.toString();
        const newUrl = `${url.pathname}${queryString ? `?${queryString}` : ""}`;
        window.history.replaceState(null, "", newUrl);

        // Debounce update lên Root AppStore để không gây lag/re-render Desktop Layout
        const currentInstanceId = isDrawer
          ? "erp-invoices"
          : instanceIndex === 2
            ? "erp-invoices__2"
            : "erp-invoices";
        debounceUrlTimerRef.current = setTimeout(() => {
          useAppStore.getState().updateCurrentTabUrl(currentInstanceId, newUrl);
        }, 300);
      }
    },
    [isDrawer, instanceIndex],
  );

  // ── Two-Way URL Sync Effect for ERP Invoices Tab ───────────────────────────
  useEffect(() => {
    if (isDrawer || typeof window === "undefined") return;

    if (debounceUrlTimerRef.current) {
      clearTimeout(debounceUrlTimerRef.current);
    }

    debounceUrlTimerRef.current = setTimeout(() => {
      const newParams = new URLSearchParams();

      // 1. Tab & Instance
      newParams.set(ErpUrlQueryParam.TAB, currentTabKey);
      if (instanceIndex === 2) {
        newParams.set(ErpUrlQueryParam.INSTANCE_INDEX, "2");
      }

      // 2. Header Tab specifics
      if (activeView === "header") {
        const headerState = useErpInvoiceListStore.getState().states[listDir];
        if (headerState) {
          if (headerState.activeTaxTab && headerState.activeTaxTab !== "all") {
            newParams.set(ErpUrlQueryParam.TAX_TAB, headerState.activeTaxTab);
          } else {
            newParams.delete(ErpUrlQueryParam.TAX_TAB);
          }

          if (headerState.status)
            newParams.set(ErpUrlQueryParam.STATUS, headerState.status);
          else newParams.delete(ErpUrlQueryParam.STATUS);

          if (headerState.search)
            newParams.set(ErpUrlQueryParam.SEARCH, headerState.search);
          else newParams.delete(ErpUrlQueryParam.SEARCH);

          if (headerState.dateFrom)
            newParams.set(ErpUrlQueryParam.DATE_FROM, headerState.dateFrom);
          else newParams.delete(ErpUrlQueryParam.DATE_FROM);

          if (headerState.dateTo)
            newParams.set(ErpUrlQueryParam.DATE_TO, headerState.dateTo);
          else newParams.delete(ErpUrlQueryParam.DATE_TO);

          if (headerState.period)
            newParams.set(ErpUrlQueryParam.PERIOD, headerState.period);
          else newParams.delete(ErpUrlQueryParam.PERIOD);

          if (headerState.seller_name)
            newParams.set(
              ErpUrlQueryParam.SELLER_NAME,
              headerState.seller_name,
            );
          else newParams.delete(ErpUrlQueryParam.SELLER_NAME);

          if (headerState.buyer_name)
            newParams.set(ErpUrlQueryParam.BUYER_NAME, headerState.buyer_name);
          else newParams.delete(ErpUrlQueryParam.BUYER_NAME);

          if (headerState.tag_id)
            newParams.set(ErpUrlQueryParam.TAG_ID, headerState.tag_id);
          else newParams.delete(ErpUrlQueryParam.TAG_ID);
        }

        if (activeColumnPresetKey && activeColumnPresetKey !== "overview") {
          newParams.set(ErpUrlQueryParam.VIEW_MODE, activeColumnPresetKey);
        } else {
          newParams.delete(ErpUrlQueryParam.VIEW_MODE);
        }

        // Column filters (cf), search (cs), sorts
        const tableState = useTableColumnStore.getState().tables[actualTableId];
        if (tableState && Object.keys(tableState.columnFilters).length > 0) {
          const encoded = encodeStateParam(tableState.columnFilters);
          if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_FILTERS, encoded);
        } else {
          newParams.delete(ErpUrlQueryParam.COLUMN_FILTERS);
        }

        if (tableState && Object.keys(tableState.columnSearch).length > 0) {
          const encoded = encodeStateParam(tableState.columnSearch);
          if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_SEARCH, encoded);
        } else {
          newParams.delete(ErpUrlQueryParam.COLUMN_SEARCH);
        }

        if (tableState && tableState.sorts.length > 0) {
          const encoded = encodeStateParam(tableState.sorts);
          if (encoded) newParams.set(ErpUrlQueryParam.SORTS, encoded);
        } else {
          newParams.delete(ErpUrlQueryParam.SORTS);
        }
      }

      // 3. Detail Drawer
      if (
        formHook.internalDrawerOpen &&
        (formHook.detailInvoice?.invoiceNo || formHook.detailInvoice?.id)
      ) {
        const detailKey =
          formHook.detailInvoice?.serialNo && formHook.detailInvoice?.invoiceNo
            ? `${formHook.detailInvoice.serialNo}_${formHook.detailInvoice.invoiceNo}`
            : formHook.detailInvoice?.invoiceNo || formHook.detailInvoice?.id;

        if (detailKey) {
          newParams.set(ErpUrlQueryParam.DETAIL, detailKey);
          if (formHook.editMode) {
            newParams.set(ErpUrlQueryParam.DRAWER_MODE, "edit");
          } else {
            newParams.delete(ErpUrlQueryParam.DRAWER_MODE);
          }
        }
      } else if (!formHook.internalDrawerOpen) {
        newParams.delete(ErpUrlQueryParam.DETAIL);
        newParams.delete(ErpUrlQueryParam.DRAWER_MODE);
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
    isDrawer,
    currentTabKey,
    activeView,
    listDir,
    actualTableId,
    instanceIndex,
    activeColumnPresetKey,
    formHook.detailInvoice?.serialNo,
    formHook.detailInvoice?.invoiceNo,
    formHook.detailInvoice?.id,
    formHook.internalDrawerOpen,
    formHook.editMode,
  ]);

  // Column View Mode Presets
  const columnPresetsTableId = isDrawer
    ? `erp-invoices-column-views-checkpoint-${direction}`
    : `erp-invoices-column-views-${direction}`;

  const currentTablePref = useUserPreferencesStore((s) =>
    actualTableId ? s.tables[actualTableId] : undefined,
  );
  const currentColumnVisibility = currentTablePref?.columnVisibility;

  // Sync activeColumnPresetKey whenever actualTableId changes
  useEffect(() => {
    if (isDrawer || activeView !== "header") return;
    const urlParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const vmFromUrl = urlParams?.get(ErpUrlQueryParam.VIEW_MODE);
    const stored = useUserPreferencesStore
      .getState()
      .getTablePreference(actualTableId);
    const targetPreset = vmFromUrl || stored?.activeView || "overview";
    setActiveColumnPresetKey(targetPreset);
  }, [actualTableId, isDrawer, activeView]);

  const columnViewPresetsHook = usePageViewPresets({
    tableId: columnPresetsTableId,
    defaultPresets: INVOICE_COLUMN_VIEW_PRESETS,
    activeView: activeColumnPresetKey,
  });
  const [viewConfigDrawerOpen, setViewConfigDrawerOpen] = useState(false);
  const [editingViewPreset, setEditingViewPreset] =
    useState<TableViewPreset | null>(null);

  const handleColumnPresetChange = useCallback(
    (preset: TableViewPreset) => {
      setActiveColumnPresetKey(preset.key);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (preset.key && preset.key !== "overview") {
          url.searchParams.set(ErpUrlQueryParam.VIEW_MODE, preset.key);
        } else {
          url.searchParams.delete(ErpUrlQueryParam.VIEW_MODE);
        }
        const newUrl = url.toString();
        window.history.replaceState(null, "", newUrl);
        const currentInstanceId = isDrawer
          ? "erp-invoices"
          : instanceIndex === 2
            ? "erp-invoices__2"
            : "erp-invoices";
        useAppStore.getState().updateCurrentTabUrl(currentInstanceId, newUrl);
      }

      // Apply column visibility to table preferences
      const currentPref = useUserPreferencesStore
        .getState()
        .getTablePreference(actualTableId) || {
        columnOrder: [],
        columnVisibility: {},
      };
      useUserPreferencesStore.getState().setTablePreferences(actualTableId, {
        ...currentPref,
        columnVisibility:
          preset.columnVisibility || DEFAULT_INVOICE_COLUMN_VISIBILITY,
        activeView: preset.key,
      });
    },
    [actualTableId, isDrawer, instanceIndex],
  );

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
        // Edit existing preset
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
          .saveTableViewPreset(columnPresetsTableId, updatedPreset);
        handleColumnPresetChange(updatedPreset);
        toast.success(t("viewModeSaveSuccess", "Đã lưu chế độ xem thành công"));
      } else {
        // Create new custom preset
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
          .saveTableViewPreset(columnPresetsTableId, newPreset);
        handleColumnPresetChange(newPreset);
        toast.success(t("viewModeSaveSuccess", "Đã lưu chế độ xem thành công"));
      }
    },
    [columnPresetsTableId, handleColumnPresetChange, t],
  );

  const handleResetViewPreset = useCallback(
    (key: string) => {
      columnViewPresetsHook.resetView(key);
      const factoryPreset = INVOICE_COLUMN_VIEW_PRESETS.find(
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
        const fallbackPreset = INVOICE_COLUMN_VIEW_PRESETS[0];
        handleColumnPresetChange(fallbackPreset);
      }
      toast.success(t("viewModeDeleteSuccess", "Đã xóa chế độ xem thành công"));
    },
    [activeColumnPresetKey, columnViewPresetsHook, handleColumnPresetChange, t],
  );

  // Hook theo dõi tiến trình nền SSE
  useInvoiceSyncProgress(loadInvoices);

  // Background Prefetching: Tải trước ngầm dữ liệu của tab đối diện khi CPU/mạng nhàn rỗi
  useEffect(() => {
    if (isDrawer || activeView !== "header") return;
    const oppositeDir: "IN" | "OUT" = direction === "IN" ? "OUT" : "IN";
    const targetStoreDir: Direction =
      instanceIndex === 2
        ? oppositeDir === "IN"
          ? "IN_2"
          : "OUT_2"
        : oppositeDir;
    const targetState =
      useErpInvoiceListStore.getState().states[targetStoreDir] ||
      useErpInvoiceListStore.getState().states.IN;

    const timer = setTimeout(() => {
      void queryClient.prefetchQuery({
        queryKey: [
          ErpQueryKey.INVOICES_LIST,
          targetStoreDir,
          undefined,
          targetState.activeTaxTab || "all",
          targetState.search || undefined,
          targetState.seller_name || undefined,
          targetState.buyer_name || undefined,
          targetState.dateFrom ? `${targetState.dateFrom}T00:00:00` : undefined,
          targetState.dateTo ? `${targetState.dateTo}T23:59:59` : undefined,
          targetState.status || undefined,
          targetState.tag_id || undefined,
          targetState.page || 1,
          targetState.pageSize || 50,
          "invoiceDate",
          "desc",
          JSON.stringify({}),
          JSON.stringify({}),
        ],
        queryFn: () =>
          erpInvoicesCoreApi.list({
            direction: oppositeDir,
            page: targetState.page || 1,
            pageSize: targetState.pageSize || 50,
            sort_by: "invoiceDate",
            sort_order: "desc",
          }),
        staleTime: DEFAULT_STALE_TIME,
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [direction, activeView, isDrawer, instanceIndex, queryClient]);

  const { data: branches = [] } = useQuery({
    queryKey: ["branches-options"],
    queryFn: getBranchOptionsApi,
  });

  // Sub-Hooks
  const modals = useInvoiceModals({
    isDrawer,
    formHook,
    urlSync,
  });

  const bulkActions = useInvoiceBulkActions({
    direction,
    t,
  });

  const buildExportBaseQuery =
    useCallback((): Partial<ErpInvoiceListParams> => {
      const targetStoreDir: Direction =
        instanceIndex === 2
          ? direction === "IN"
            ? "IN_2"
            : "OUT_2"
          : direction;
      const headerState =
        useErpInvoiceListStore.getState().states[targetStoreDir] ||
        useErpInvoiceListStore.getState().states.IN;
      const targetTableId = isDrawer
        ? `erp-invoices-table-checkpoint-${direction}`
        : `erp-invoices-table-${targetStoreDir}`;
      const tableState = useTableColumnStore.getState().tables[
        targetTableId
      ] || {
        columnFilters: {},
        columnSearch: {},
        sorts: [],
      };

      const activeSort = tableState.sorts[0] || "";
      let sortBy: string | undefined = undefined;
      let sortOrder: "asc" | "desc" | undefined = undefined;
      if (activeSort.startsWith("-")) {
        sortBy = activeSort.substring(1);
        sortOrder = "desc";
      } else if (activeSort) {
        sortBy = activeSort;
        sortOrder = "asc";
      }

      return {
        direction,
        search: headerState.search || undefined,
        seller_name: headerState.seller_name || undefined,
        buyer_name: headerState.buyer_name || undefined,
        status: headerState.status || undefined,
        tag_id: headerState.tag_id || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        column_search:
          Object.keys(tableState.columnSearch).length > 0
            ? JSON.stringify(tableState.columnSearch)
            : undefined,
        column_filters:
          Object.keys(tableState.columnFilters).length > 0
            ? JSON.stringify(tableState.columnFilters)
            : undefined,
      };
    }, [direction, instanceIndex, isDrawer]);

  const pageTabs = useMemo(
    () =>
      !isDrawer
        ? [
            { value: "in", label: t("inbound", "Hóa đơn mua vào") },
            {
              value: "in-lines",
              label: t("inboundLines", "Chi tiết mua vào"),
            },
            { value: "out", label: t("outbound", "Hóa đơn bán ra") },
            {
              value: "out-lines",
              label: t("outboundLines", "Chi tiết bán ra"),
            },
          ]
        : undefined,
    [isDrawer, t],
  );

  return {
    t,
    direction,
    isDrawer,
    listDir,
    canEditInvoice,
    formHook,
    urlSync,
    pageTabs,
    currentTabKey,
    handleTabChange,
    activeView,
    setActiveView,
    branches,
    // View Config Drawer
    viewConfigDrawerOpen,
    setViewConfigDrawerOpen,
    editingViewPreset,
    handleSaveViewPreset,
    handleResetViewPreset,
    handleOpenCreateView,
    handleOpenEditView,
    handleDeleteViewPreset,
    currentColumnVisibility,
    activeColumnPresetKey,
    handleColumnPresetChange,
    loadInvoices,
    invoices,
    buildExportBaseQuery,
    // Modals
    ...modals,
    // Bulk Actions
    ...bulkActions,
  };
}
