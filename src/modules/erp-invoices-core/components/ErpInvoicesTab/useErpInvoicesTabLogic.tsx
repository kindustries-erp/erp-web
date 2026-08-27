import React, { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

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
import { PillTabs } from "@/shared/components/PillTabs";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
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

export interface ErpInvoicesTabProps {
  direction: "IN" | "OUT";
  initialDateFrom?: string;
  initialDateTo?: string;
  isDrawer?: boolean;
  instanceIndex?: 1 | 2;
  partnerTaxCode?: string;
}

export function useErpInvoicesTabLogic({
  direction,
  initialDateFrom,
  initialDateTo,
  isDrawer = false,
  instanceIndex = 1,
}: ErpInvoicesTabProps) {
  const { t } = useTranslation("erpInvoices");
  const canEditInvoice = useHasPermission("invoices", "update");

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
      formHook.openInternal({ id } as ErpInvoice);
    },
    closeDrawer: () => {
      formHook.closeDrawer();
    },
    onHydrate: (state) => {
      const urlParams =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;
      const taxTabFromUrl =
        urlParams?.get("tax_tab") ||
        (state.view &&
        ["all", "new", "replacement", "adjustment"].includes(state.view)
          ? state.view
          : null);

      if (taxTabFromUrl) {
        listHook.setActiveTaxTab(taxTabFromUrl);
      }
    },
  });

  // PillTabs state tab handling (API-driven, not column-filter driven)
  const activeTaxPresetKey = listHook.activeTaxTab || "all";

  const handleTaxTabChange = (tab: string) => {
    listHook.setActiveTaxTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tab && tab !== "all") {
        url.searchParams.set("tax_tab", tab);
      } else {
        url.searchParams.delete("tax_tab");
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

  const [activeColumnPresetKey, setActiveColumnPresetKey] = useState<string>(
    () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const vmParam = urlParams.get("view_mode");
        if (vmParam) return vmParam;
      }
      const stored = useUserPreferencesStore
        .getState()
        .getTablePreference(actualTableId);
      return stored?.activeView || "overview";
    },
  );

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
        url.searchParams.set("view_mode", preset.key);
      } else {
        url.searchParams.delete("view_mode");
      }
      window.history.replaceState(null, "", url.toString());
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

  // Sync manual filter panel changes to URL
  useEffect(() => {
    if (isDrawer) return;
    const { status, search, dateFrom, dateTo, period, custom } =
      listHook.filterPanel.state;
    urlSync.syncFiltersToUrl({
      status: status || "",
      search: search || "",
      dateFrom: dateFrom || "",
      dateTo: dateTo || "",
      period: period || "",
      seller_name: custom?.seller_name || "",
      buyer_name: custom?.buyer_name || "",
      tag_id: (custom?.tag_id as string) || "",
    });
  }, [
    isDrawer,
    listHook.filterPanel.state.status,
    listHook.filterPanel.state.search,
    listHook.filterPanel.state.dateFrom,
    listHook.filterPanel.state.dateTo,
    listHook.filterPanel.state.period,
    listHook.filterPanel.state.custom?.seller_name,
    listHook.filterPanel.state.custom?.buyer_name,
    listHook.filterPanel.state.custom?.tag_id,
  ]);

  useEffect(() => {
    if (isDrawer && (initialDateFrom || initialDateTo)) {
      if (initialDateFrom) listHook.filterPanel.setDateFrom(initialDateFrom);
      if (initialDateTo) listHook.filterPanel.setDateTo(initialDateTo);
      listHook.setPage(1);
    }
  }, [isDrawer, initialDateFrom, initialDateTo]);

  // Hook theo dõi tiến trình nền SSE
  useInvoiceSyncProgress(listHook.loadInvoices);

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

  const [activeView, setActiveView] = useState<"header" | "lines">(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get("tab") || searchParams.get("view");
      if (tabParam === "lines") return "lines";
    }
    return "header";
  });

  const handleViewChange = (newView: "header" | "lines") => {
    setActiveView(newView);
    if (!isDrawer && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newView === "lines") {
        url.searchParams.set("tab", "lines");
        url.searchParams.delete("view");
      } else {
        url.searchParams.set("tab", "header");
        url.searchParams.delete("view");
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  const pageTabs = useMemo(
    () =>
      !isDrawer
        ? [
            { value: "header", label: t("tabs.headerView", "Hóa đơn tổng") },
            {
              value: "lines",
              label: t("tabs.linesView", "Chi tiết dòng hàng"),
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
    activeView,
    setActiveView,
    handleViewChange,
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
    currentColumnVisibility,
    // Modals
    ...modals,
    // Bulk Actions
    ...bulkActions,
    // Table Handlers
    buildExportBaseQuery: tableHandlers.buildExportBaseQuery,
  };
}
