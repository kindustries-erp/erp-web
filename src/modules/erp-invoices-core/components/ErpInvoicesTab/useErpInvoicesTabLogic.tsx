import React, { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { getTags } from "@/modules/tags/api/tagsApi";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { useInvoiceSyncProgress } from "@/modules/erp-invoices-core/hooks/useInvoiceSyncProgress";
import { useErpInvoiceUrlSync } from "@/modules/erp-invoices-core/hooks/useErpInvoiceUrlSync";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import { PillTabs } from "@/shared/components/PillTabs";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import type { FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import { DEFAULT_INVOICE_PRESETS } from "./utils";
import { useInvoiceColumns } from "./components/InvoiceColumns";
import { useInvoiceSummary } from "./hooks/useInvoiceSummary";
import { useInvoiceTableHandlers } from "./hooks/useInvoiceTableHandlers";
import { useInvoiceModals } from "./hooks/useInvoiceModals";
import { useInvoiceBulkActions } from "./hooks/useInvoiceBulkActions";

export interface ErpInvoicesTabProps {
  direction: "IN" | "OUT";
  initialDateFrom?: string;
  initialDateTo?: string;
  isDrawer?: boolean;
  instanceIndex?: 1 | 2;
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
      let taxVals: string[] | undefined = state.columnFilters?.taxInvoiceStatus;
      if (!taxVals && state.view) {
        const preset = DEFAULT_INVOICE_PRESETS.find(
          (p) => p.key === state.view,
        );
        if (preset?.columnFilters?.taxInvoiceStatus) {
          taxVals = preset.columnFilters.taxInvoiceStatus;
        }
      }
      if (taxVals && taxVals.length > 0) {
        listHook.tableState.setColumnFilter("taxInvoiceStatus", taxVals);
      }
    },
  });

  const currentTaxFilter =
    listHook.tableState.columnFilters["taxInvoiceStatus"] || [];

  const activeTaxPresetKey = useMemo(() => {
    if (currentTaxFilter.length === 1 && currentTaxFilter[0] === "1")
      return "new";
    if (
      currentTaxFilter.length === 2 &&
      currentTaxFilter.includes("2") &&
      currentTaxFilter.includes("4")
    )
      return "replacement";
    if (
      currentTaxFilter.length === 2 &&
      currentTaxFilter.includes("3") &&
      currentTaxFilter.includes("5")
    )
      return "adjustment";
    if (currentTaxFilter.length === 0) return "all";
    return urlSync.activeView || "all";
  }, [currentTaxFilter, urlSync.activeView]);

  const viewPresetsHook = usePageViewPresets({
    tableId: isDrawer
      ? `erp-invoices-table-checkpoint-${direction}`
      : `erp-invoices-table-${direction}`,
    defaultPresets: DEFAULT_INVOICE_PRESETS,
    activeView: activeTaxPresetKey,
    onViewChange: (preset) => {
      urlSync.setView(preset.key);
      const taxStatusVals = preset.columnFilters?.taxInvoiceStatus || [];
      if (taxStatusVals.length > 0) {
        listHook.tableState.setColumnFilter("taxInvoiceStatus", taxStatusVals);
      } else {
        listHook.tableState.setColumnFilter("taxInvoiceStatus", []);
      }
      if (preset.filters.status !== undefined) {
        listHook.filterPanel.setStatus(preset.filters.status);
      }
      if (preset.filters.dateFrom !== undefined) {
        listHook.filterPanel.setDateFrom(preset.filters.dateFrom);
      }
      if (preset.filters.dateTo !== undefined) {
        listHook.filterPanel.setDateTo(preset.filters.dateTo);
      }
      listHook.setPage(1);
    },
  });

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

  const columns = useInvoiceColumns({
    direction,
    t,
    branches,
    listHook,
    openPopoverId: modals.openPopoverId,
    setOpenPopoverId: modals.setOpenPopoverId,
    setPreviewPdf: modals.setPreviewPdf,
    setSelectedPartner: modals.setSelectedPartner,
    setPartnerDrawerOpen: modals.setPartnerDrawerOpen,
    handleOpenInternal: modals.handleOpenInternal,
    handleDownload: modals.handleDownload,
    handlePreviewPdf: modals.handlePreviewPdf,
    getSortState: tableHandlers.getSortState,
    handleSortChange: tableHandlers.handleSortChange,
    handleSearchChange: tableHandlers.handleSearchChange,
    handleFilterChange: tableHandlers.handleFilterChange,
    fetchInvoiceOptions: tableHandlers.fetchInvoiceOptions,
  });

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

  const viewTabsNode = !isDrawer ? (
    <div className="w-full sm:w-auto flex items-center overflow-x-auto py-0.5">
      <PillTabs
        className="w-full sm:w-auto shrink-0"
        listClassName="h-8 p-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03)]"
        triggerClassName="h-7 px-3.5 text-xs rounded-full"
        items={viewPresetsHook.presets.map((p) => {
          let label = p.label;
          if (p.key === "all") label = t("tabAll", "Tất cả");
          else if (p.key === "new") label = t("tabNew", "Mới");
          else if (p.key === "replacement")
            label = t("tabReplacement", "Thay thế");
          else if (p.key === "adjustment")
            label = t("tabAdjustment", "Điều chỉnh");
          return {
            value: p.key,
            label,
          };
        })}
        value={activeTaxPresetKey}
        onValueChange={(v: string) => viewPresetsHook.selectView(v)}
        hideBorder
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
    filterConfig,
    activeSortKey: listHook.sortBy,
    activeSortOrder: listHook.sortOrder,
    branches,
    // Modals
    ...modals,
    // Bulk Actions
    ...bulkActions,
    // Table Handlers
    buildExportBaseQuery: tableHandlers.buildExportBaseQuery,
  };
}
