import React, { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { useAppStore } from "@/core/config/appStore";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { ErpQueryKey, DEFAULT_STALE_TIME } from "@/shared/lib/queryKeys";
import { getTags } from "@/modules/tags/api/tagsApi";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { useInvoiceSyncProgress } from "@/modules/erp-invoices-core/hooks/useInvoiceSyncProgress";
import { useErpInvoiceUrlSync } from "@/modules/erp-invoices-core/hooks/useErpInvoiceUrlSync";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "@/shared/hooks/useUserPreferences";
import { useTableColumnStore } from "@/shared/hooks/useTableColumnState";
import { PillTabs } from "@/shared/components/PillTabs";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type { FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import {
  INVOICE_COLUMN_VIEW_PRESETS,
  DEFAULT_INVOICE_COLUMN_VISIBILITY,
} from "./utils";
import { useInvoiceColumns } from "./components/InvoiceColumns";
import { useInvoiceSummary } from "./hooks/useInvoiceSummary";
import { useInvoiceTableHandlers } from "./hooks/useInvoiceTableHandlers";
import { useInvoiceModals } from "./hooks/useInvoiceModals";
import { useInvoiceBulkActions } from "./hooks/useInvoiceBulkActions";
import { InvoiceViewModeCombobox } from "./components/InvoiceViewModeCombobox";
import {
  useErpInvoiceListStore,
  type Direction,
} from "@/modules/erp-invoices-core/hooks/useErpInvoiceListStore";
import { useErpInvoiceItemsStore } from "@/modules/erp-invoices-core/hooks/useErpInvoiceItemsStore";
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
  initialDateFrom,
  initialDateTo,
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

  const handleTabChange = (newTab: string) => {
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
      const currentDetail = url.searchParams.get("detail");
      const currentDmode = url.searchParams.get("dmode");
      const currentI = url.searchParams.get("_i");

      const newParams = new URLSearchParams();
      newParams.set("tab", newTab);
      if (currentI) {
        newParams.set("_i", currentI);
      }
      if (currentDetail) {
        newParams.set("detail", currentDetail);
      }
      if (currentDmode) {
        newParams.set("dmode", currentDmode);
      }

      const targetStoreDir: Direction =
        instanceIndex === 2 ? (nextDir === "IN" ? "IN_2" : "OUT_2") : nextDir;

      if (nextView === "header") {
        const headerState =
          useErpInvoiceListStore.getState().states[targetStoreDir];
        if (headerState) {
          if (headerState.activeTaxTab && headerState.activeTaxTab !== "all") {
            newParams.set("tax_tab", headerState.activeTaxTab);
          }
          if (headerState.status) newParams.set("status", headerState.status);
          if (headerState.search) newParams.set("search", headerState.search);
          if (headerState.dateFrom)
            newParams.set("dateFrom", headerState.dateFrom);
          if (headerState.dateTo) newParams.set("dateTo", headerState.dateTo);
          if (headerState.period) newParams.set("period", headerState.period);
          if (headerState.seller_name)
            newParams.set("seller_name", headerState.seller_name);
          if (headerState.buyer_name)
            newParams.set("buyer_name", headerState.buyer_name);
          if (headerState.tag_id) newParams.set("tag_id", headerState.tag_id);
        }

        const targetTableId = isDrawer
          ? `erp-invoices-table-checkpoint-${nextDir}`
          : `erp-invoices-table-${targetStoreDir}`;
        const targetTablePref = useUserPreferencesStore
          .getState()
          .getTablePreference(targetTableId);
        const targetViewMode = targetTablePref?.activeView || "overview";
        if (targetViewMode && targetViewMode !== "overview") {
          newParams.set("view_mode", targetViewMode);
        }
        setActiveColumnPresetKey(targetViewMode);

        const targetTableState =
          useTableColumnStore.getState().tables[targetTableId];
        if (
          targetTableState &&
          Object.keys(targetTableState.columnFilters).length > 0
        ) {
          const encoded = encodeStateParam(targetTableState.columnFilters);
          if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_FILTERS, encoded);
        }
        if (
          targetTableState &&
          Object.keys(targetTableState.columnSearch).length > 0
        ) {
          const encoded = encodeStateParam(targetTableState.columnSearch);
          if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_SEARCH, encoded);
        }
        if (targetTableState && targetTableState.sorts.length > 0) {
          const encoded = encodeStateParam(targetTableState.sorts);
          if (encoded) newParams.set(ErpUrlQueryParam.SORTS, encoded);
        }
      } else {
        const linesState =
          useErpInvoiceItemsStore.getState().states[targetStoreDir];
        if (linesState) {
          if (
            linesState.subcategoryFilter &&
            linesState.subcategoryFilter !== "ALL"
          ) {
            newParams.set("subcat", linesState.subcategoryFilter);
          }
          if (linesState.status) newParams.set("status", linesState.status);
          if (linesState.search) newParams.set("search", linesState.search);
          if (linesState.dateFrom)
            newParams.set("dateFrom", linesState.dateFrom);
          if (linesState.dateTo) newParams.set("dateTo", linesState.dateTo);
          if (linesState.period) newParams.set("period", linesState.period);
          if (linesState.sellerName)
            newParams.set("seller_name", linesState.sellerName);
          if (linesState.buyerName)
            newParams.set("buyer_name", linesState.buyerName);
          if (linesState.tagId) newParams.set("tag_id", linesState.tagId);
        }

        const targetLinesTableId = isDrawer
          ? `erp-invoice-items-table-checkpoint-${nextDir}`
          : `erp-invoice-items-table-${targetStoreDir}`;
        const targetLinesTableState =
          useTableColumnStore.getState().tables[targetLinesTableId];
        if (
          targetLinesTableState &&
          Object.keys(targetLinesTableState.columnFilters).length > 0
        ) {
          const encoded = encodeStateParam(targetLinesTableState.columnFilters);
          if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_FILTERS, encoded);
        }
        if (
          targetLinesTableState &&
          Object.keys(targetLinesTableState.columnSearch).length > 0
        ) {
          const encoded = encodeStateParam(targetLinesTableState.columnSearch);
          if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_SEARCH, encoded);
        }
        if (targetLinesTableState && targetLinesTableState.sorts.length > 0) {
          const encoded = encodeStateParam(targetLinesTableState.sorts);
          if (encoded) newParams.set(ErpUrlQueryParam.SORTS, encoded);
        }
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
  };

  const direction = currentDirection;

  const listDir = isDrawer
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

  const listHook = useErpInvoicesList(listDir);
  const formHook = useErpInvoiceForm(listHook.loadInvoices);

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
        listHook.setActiveTaxTab(taxTabFromUrl);
      }

      const vmFromUrl = urlParams?.get(ErpUrlQueryParam.VIEW_MODE);
      if (isHeaderTab && vmFromUrl) {
        setActiveColumnPresetKey(vmFromUrl);
      }

      if (state.sorts && state.sorts.length > 0) {
        listHook.tableState.setSort(
          state.sorts[0].replace("-", ""),
          state.sorts[0].startsWith("-") ? "desc" : "asc",
        );
      }
    },
  });

  // ── Two-Way URL Sync Effect for ERP Invoices Tab ───────────────────────────
  const debounceUrlTimerRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

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
        if (listHook.activeTaxTab && listHook.activeTaxTab !== "all") {
          newParams.set(ErpUrlQueryParam.TAX_TAB, listHook.activeTaxTab);
        } else {
          newParams.delete(ErpUrlQueryParam.TAX_TAB);
        }

        if (activeColumnPresetKey && activeColumnPresetKey !== "overview") {
          newParams.set(ErpUrlQueryParam.VIEW_MODE, activeColumnPresetKey);
        } else {
          newParams.delete(ErpUrlQueryParam.VIEW_MODE);
        }

        // Filters
        const headerState = useErpInvoiceListStore.getState().states[listDir];
        if (headerState) {
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

        // Column filters (cf)
        if (Object.keys(listHook.tableState.columnFilters).length > 0) {
          const encoded = encodeStateParam(listHook.tableState.columnFilters);
          if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_FILTERS, encoded);
        } else {
          newParams.delete(ErpUrlQueryParam.COLUMN_FILTERS);
        }

        // Column search (cs)
        if (Object.keys(listHook.tableState.columnSearch).length > 0) {
          const encoded = encodeStateParam(listHook.tableState.columnSearch);
          if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_SEARCH, encoded);
        } else {
          newParams.delete(ErpUrlQueryParam.COLUMN_SEARCH);
        }

        // Sorts
        if (listHook.tableState.sorts.length > 0) {
          const encoded = encodeStateParam(listHook.tableState.sorts);
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
    instanceIndex,
    listHook.activeTaxTab,
    activeColumnPresetKey,
    listHook.tableState.columnFilters,
    listHook.tableState.columnSearch,
    listHook.tableState.sorts,
    formHook.detailInvoice?.serialNo,
    formHook.detailInvoice?.invoiceNo,
    formHook.detailInvoice?.id,
    formHook.internalDrawerOpen,
    formHook.editMode,
  ]);

  // PillTabs state tab handling (API-driven, not column-filter driven)
  const activeTaxPresetKey = listHook.activeTaxTab || "all";

  const handleTaxTabChange = (tab: string) => {
    listHook.setActiveTaxTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tab && tab !== "all") {
        url.searchParams.set(ErpUrlQueryParam.TAX_TAB, tab);
      } else {
        url.searchParams.delete(ErpUrlQueryParam.TAX_TAB);
      }
      window.history.replaceState(null, "", url.toString());
    }
    listHook.setPage(1);
  };

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

  const handleColumnPresetChange = (preset: TableViewPreset) => {
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

    // Reset filters but keep activeTaxTab
    listHook.filterPanel.resetAll();
    listHook.tableState.resetFilters();
    listHook.setPage(1);
  };

  const handleOpenCreateView = () => {
    setEditingViewPreset(null);
    setViewConfigDrawerOpen(true);
  };

  const handleOpenEditView = (preset: TableViewPreset) => {
    setEditingViewPreset(preset);
    setViewConfigDrawerOpen(true);
  };

  const handleSaveViewPreset = (data: {
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
  };

  const handleResetViewPreset = (key: string) => {
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
  };

  const handleDeleteViewPreset = (key: string) => {
    if (key === "overview" || key === "audit") return;
    columnViewPresetsHook.deleteView(key);
    if (activeColumnPresetKey === key) {
      const fallbackPreset = INVOICE_COLUMN_VIEW_PRESETS[0];
      handleColumnPresetChange(fallbackPreset);
    }
    toast.success(t("viewModeDeleteSuccess", "Đã xóa chế độ xem thành công"));
  };

  useEffect(() => {
    if (isDrawer && (initialDateFrom || initialDateTo)) {
      if (initialDateFrom) listHook.filterPanel.setDateFrom(initialDateFrom);
      if (initialDateTo) listHook.filterPanel.setDateTo(initialDateTo);
      listHook.setPage(1);
    }
  }, [isDrawer, initialDateFrom, initialDateTo]);

  // Hook theo dõi tiến trình nền SSE
  useInvoiceSyncProgress(listHook.loadInvoices);

  // Background Prefetching: Tải trước ngầm dữ liệu của tab đối diện khi CPU/mạng nhàn rỗi
  const queryClient = useQueryClient();
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

  const { data: allTags = [] } = useQuery({
    queryKey: ["sys-tags"],
    queryFn: getTags,
  });

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

  const tableHandlers = useInvoiceTableHandlers({
    direction,
    branches,
    listHook,
  });

  const bulkActions = useInvoiceBulkActions({
    direction,
    t,
  });

  const invoiceColumnsOptions = useMemo(
    () => ({
      direction,
      t,
      branches,
      listHook,
      openPopoverId: modals.openPopoverId,
      setOpenPopoverId: modals.setOpenPopoverId,
      setPreviewPdf: modals.setPreviewPdf,
      handleOpenInternal: modals.handleOpenInternal,
      handleDownload: modals.handleDownload,
      handlePreviewPdf: modals.handlePreviewPdf,
      getSortState: tableHandlers.getSortState,
      handleSortChange: tableHandlers.handleSortChange,
      handleSearchChange: tableHandlers.handleSearchChange,
      handleFilterChange: tableHandlers.handleFilterChange,
      fetchInvoiceOptions: tableHandlers.fetchInvoiceOptions,
    }),
    [
      direction,
      t,
      branches,
      listHook.tableState.columnFilters,
      listHook.tableState.columnSearch,
      listHook.tableState.sorts,
      listHook.activeTaxTab,
      listHook.filterPanel.state.dateFrom,
      listHook.filterPanel.state.dateTo,
      modals.openPopoverId,
      modals.setOpenPopoverId,
      modals.setPreviewPdf,
      modals.handleOpenInternal,
      modals.handleDownload,
      modals.handlePreviewPdf,
      tableHandlers.getSortState,
      tableHandlers.handleSortChange,
      tableHandlers.handleSearchChange,
      tableHandlers.handleFilterChange,
      tableHandlers.fetchInvoiceOptions,
    ],
  );

  const columns = useInvoiceColumns(invoiceColumnsOptions);

  const summaryRow = useInvoiceSummary(listHook.invoices);

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      noDefaultPeriod: true,
      custom: [
        {
          key: "tag_id",
          label: t("tag", "Thẻ nhãn"),
          placeholder: t("allTags", "Tất cả thẻ"),
          options: allTags.map((tag) => ({ value: tag.id, label: tag.name })),
          type: "combobox" as const,
        },
      ],
    }),
    [t, allTags],
  );

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

  const viewTabsNode = !isDrawer ? (
    <div className="w-full sm:w-auto flex items-center flex-wrap gap-2 py-0.5">
      <PillTabs
        className="w-full sm:w-auto shrink-0"
        listClassName="h-8 p-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03)]"
        triggerClassName="h-7 px-2.5 sm:px-3.5 text-xs rounded-full"
        items={[
          { value: "all", label: t("tabAll", "Tất cả") },
          { value: "new", label: t("tabNew", "Mới") },
          { value: "replacement", label: t("tabReplacement", "Thay thế") },
          { value: "adjustment", label: t("tabAdjustment", "Điều chỉnh") },
        ]}
        value={activeTaxPresetKey}
        onValueChange={handleTaxTabChange}
        hideBorder
      />

      <div className="hidden sm:block h-4 w-px bg-slate-300/80 dark:bg-slate-700/80 shrink-0" />

      <InvoiceViewModeCombobox
        presets={columnViewPresetsHook.presets}
        activePresetKey={activeColumnPresetKey}
        onSelect={handleColumnPresetChange}
        onCreateView={handleOpenCreateView}
        onEditView={handleOpenEditView}
        onDeleteView={handleDeleteViewPreset}
      />
    </div>
  ) : undefined;

  return {
    t,
    direction,
    isDrawer,
    listDir,
    canEditInvoice,
    listHook,
    formHook,
    urlSync,
    columns,
    summaryRow,
    viewTabsNode,
    pageTabs,
    currentTabKey,
    handleTabChange,
    activeView,
    setActiveView,
    filterConfig,
    activeSortKey: listHook.sortBy,
    activeSortOrder: listHook.sortOrder,
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
    // Modals
    ...modals,
    // Bulk Actions
    ...bulkActions,
    // Table Handlers
    buildExportBaseQuery: tableHandlers.buildExportBaseQuery,
  };
}
