import React, { useMemo, useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Receipt,
  DownloadCloud,
  Eye,
  Pencil,
  Download,
  Trash,
  KeyRound,
  Scale,
  Settings,
  Building2,
} from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { PillTabs } from "@/shared/components/PillTabs";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "@/shared/hooks/useUserPreferences";
import { getTags } from "@/modules/tags/api/tagsApi";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/core/config/uiStore";
import type { TabItem } from "@/shared/components/PageLayout";
import type { FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import {
  getPdfAttachments,
  getInvoiceRowClassName,
  DEFAULT_INVOICE_COLUMN_VISIBILITY,
  INVOICE_COLUMN_VIEW_PRESETS,
} from "../utils";
import { useInvoiceColumns } from "./InvoiceColumns";
import { useInvoiceSummary } from "../hooks/useInvoiceSummary";
import { useInvoiceTableHandlers } from "../hooks/useInvoiceTableHandlers";
import { InvoiceViewModeCombobox } from "./InvoiceViewModeCombobox";

export interface InvoiceHeaderSectionProps {
  direction: "IN" | "OUT";
  instanceIndex?: 1 | 2;
  isDrawer?: boolean;
  partnerTaxCode?: string;
  canEditInvoice?: boolean;
  tabs?: TabItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  handleOpenInternal: (inv: any, mode?: "view" | "edit", tab?: string) => void;
  handleDownload: (id: string, type: "pdf" | "xml") => Promise<void>;
  handleExportExcel: () => void;
  onOpenSync: () => void;
  onOpenPortalAuth: () => void;
  setNetOffInvoice: (inv: any) => void;
  formHook: any;
  openCustomFieldsDrawer: (module: string, label: string) => void;
  showToast: (payload: any) => void;
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  bulkActionsNode?: React.ReactNode;
  activePresetKey?: string;
  presets?: TableViewPreset[];
  onSelectViewPreset?: (preset: TableViewPreset) => void;
  onOpenViewConfig: (preset: TableViewPreset) => void;
  onOpenCreateView: () => void;
  onDeleteViewPreset: (key: string) => void;
  setPreviewPdf: (
    pdf: {
      url: string;
      filename: string;
      fileKey: string;
      invoiceId: string;
      isAttachment?: boolean;
    } | null,
  ) => void;
  handlePreviewPdf: (
    id: string,
    key: string,
    filename: string,
  ) => Promise<void>;
}

export const InvoiceHeaderSection = React.memo(function InvoiceHeaderSection({
  direction,
  instanceIndex = 1,
  isDrawer = false,
  partnerTaxCode,
  canEditInvoice = true,
  tabs,
  activeTab,
  onTabChange,
  handleOpenInternal,
  handleDownload,
  handleExportExcel,
  onOpenSync,
  onOpenPortalAuth,
  setNetOffInvoice,
  formHook,
  openCustomFieldsDrawer,
  showToast,
  rowSelection,
  setRowSelection,
  bulkActionsNode,
  activePresetKey,
  presets,
  onSelectViewPreset,
  onOpenViewConfig,
  onOpenCreateView,
  onDeleteViewPreset,
  setPreviewPdf,
  handlePreviewPdf,
}: InvoiceHeaderSectionProps) {
  const { t } = useTranslation("erpInvoices");

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

  const listHook = useErpInvoicesList(listDir, partnerTaxCode);

  const { data: allTags = [] } = useQuery({
    queryKey: ["sys-tags"],
    queryFn: getTags,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches-options"],
    queryFn: getBranchOptionsApi,
  });

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

  // Column Presets
  const columnPresetsTableId = isDrawer
    ? `erp-invoices-column-views-checkpoint-${direction}`
    : `erp-invoices-column-views-${direction}`;

  const currentTablePref = useUserPreferencesStore((s) =>
    actualTableId ? s.tables[actualTableId] : undefined,
  );
  const fallbackActivePresetKey = currentTablePref?.activeView || "overview";
  const effectiveActivePresetKey = activePresetKey || fallbackActivePresetKey;

  const columnViewPresetsHook = usePageViewPresets({
    tableId: columnPresetsTableId,
    defaultPresets: INVOICE_COLUMN_VIEW_PRESETS,
    activeView: effectiveActivePresetKey,
  });

  const handleColumnPresetChange = useCallback(
    (preset: TableViewPreset) => {
      if (onSelectViewPreset) {
        onSelectViewPreset(preset);
        return;
      }
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
    [actualTableId, onSelectViewPreset],
  );

  const handleTaxTabChange = useCallback(
    (tab: string) => {
      listHook.setActiveTaxTab(tab);
      listHook.tableState.setColumnFilter("taxInvoiceStatus", []);
      listHook.setPage(1);
    },
    [listHook],
  );

  const activeTaxPresetKey = listHook.activeTaxTab || "all";

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
        presets={presets || columnViewPresetsHook.presets}
        activePresetKey={effectiveActivePresetKey}
        onSelect={onSelectViewPreset || handleColumnPresetChange}
        onCreateView={onOpenCreateView}
        onEditView={onOpenViewConfig}
        onDeleteView={onDeleteViewPreset}
      />
    </div>
  ) : undefined;

  const tableHandlers = useInvoiceTableHandlers({
    direction,
    branches,
    listHook,
  });

  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const columns = useInvoiceColumns({
    direction,
    t,
    branches,
    listHook,
    openPopoverId,
    setOpenPopoverId,
    setPreviewPdf,
    handleOpenInternal,
    handleDownload,
    handlePreviewPdf,
    getSortState: tableHandlers.getSortState,
    handleSortChange: tableHandlers.handleSortChange,
    handleSearchChange: tableHandlers.handleSearchChange,
    handleFilterChange: tableHandlers.handleFilterChange,
    fetchInvoiceOptions: tableHandlers.fetchInvoiceOptions,
  });

  const summaryRow = useInvoiceSummary(listHook.invoices);

  const rowActions = React.useCallback(
    (inv: any) => {
      const traCuuItems = [];
      const thaoTacItems = [];

      traCuuItems.push({
        label: t("actionDetail", "Chi tiết hóa đơn"),
        icon: <Eye className="w-3.5 h-3.5" />,
        onClick: () => handleOpenInternal(inv, "view"),
      });

      traCuuItems.push({
        label: t("actionObjectDetails", "Chi tiết theo đối tượng"),
        icon: <Building2 className="w-3.5 h-3.5" />,
        onClick: () => handleOpenInternal(inv, "view", "partner"),
      });

      if (canEditInvoice && inv.status !== "CANCELLED") {
        thaoTacItems.push({
          label: t("actionEdit", "Chỉnh sửa"),
          icon: <Pencil className="w-3.5 h-3.5" />,
          onClick: () => handleOpenInternal(inv, "edit"),
        });
      }

      if (inv.xmlFileKey) {
        thaoTacItems.push({
          label: t("actionDownloadXml", "Tải XML"),
          icon: <Download className="w-3.5 h-3.5" />,
          onClick: () => void handleDownload(inv.id, "xml"),
        });
      }
      const hasPdf =
        Boolean(inv.pdfFileKey) ||
        Boolean(inv.pdfFiles && inv.pdfFiles.length > 0) ||
        Boolean(
          inv.attachments && getPdfAttachments(inv.attachments).length > 0,
        );
      if (hasPdf) {
        thaoTacItems.push({
          label: t("actionDownloadPdf", "Tải PDF"),
          icon: <Download className="w-3.5 h-3.5" />,
          onClick: async () => {
            if (inv.attachments && inv.attachments.length > 1) {
              try {
                showToast({
                  title: "Đang nén file PDF...",
                  variant: "default",
                });
                const blob = await erpInvoicesCoreApi.downloadPdfsZip(inv.id);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `hoadon_${inv.id}_pdfs.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              } catch {
                showToast({
                  title: "Không thể tải file PDF",
                  variant: "destructive",
                });
              }
            } else if (inv.attachments && inv.attachments.length === 1) {
              const f = inv.attachments[0];
              try {
                const { url } = await erpInvoicesCoreApi.getPdfDownloadUrl(
                  inv.id,
                  f.attachment?.fileKey,
                  false,
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = f.attachment?.fileName || "document.pdf";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              } catch {
                showToast({
                  title: "Không thể tải file PDF",
                  variant: "destructive",
                });
              }
            } else if (inv.pdfFileKey) {
              void handleDownload(inv.id, "pdf");
            }
          },
        });
      }

      if (canEditInvoice && inv.status !== "CANCELLED") {
        thaoTacItems.push({
          label: t("actionNetOff", "Cấn trừ sao kê"),
          icon: <Scale className="w-3.5 h-3.5" />,
          onClick: () => setNetOffInvoice(inv),
        });
      }

      if (inv.status === "DRAFT") {
        thaoTacItems.push({
          label: t("actionDelete", "Xóa"),
          icon: <Trash className="w-3.5 h-3.5" />,
          variant: "danger" as const,
          onClick: () => {
            handleOpenInternal(inv);
            formHook.setDeleteConfirm(true);
          },
        });
      }

      return [
        {
          groupLabel: t("groupTraCuu", "Tra cứu"),
          items: traCuuItems,
        },
        {
          groupLabel: t("groupThaoTac", "Thao tác"),
          items: thaoTacItems,
        },
        {
          groupLabel: t("groupCauHinh", "Cấu hình"),
          items: [
            {
              label: t(
                "invoiceConfig.customFields",
                "Cấu hình trường tùy chỉnh",
              ),
              icon: <Settings className="w-3.5 h-3.5 text-violet-500" />,
              onClick: () => openCustomFieldsDrawer("INVOICE", "Hóa đơn"),
            },
          ],
        },
      ];
    },
    [
      t,
      canEditInvoice,
      handleOpenInternal,
      handleDownload,
      showToast,
      setNetOffInvoice,
      formHook,
      openCustomFieldsDrawer,
    ],
  );

  const createActions = useMemo(
    () => [
      {
        groupLabel: t("groupTraCuu", "Tra cứu"),
        items: [
          {
            label: t("exportExcel", "Xuất Excel"),
            icon: <Download className="w-4 h-4 text-green-600" />,
            onClick: handleExportExcel,
          },
        ],
      },
      ...(canEditInvoice
        ? [
            {
              groupLabel: t("groupThaoTac", "Thao tác"),
              items: [
                {
                  label: t("loginTaxPortal", "Đăng nhập Cổng Thuế"),
                  icon: <KeyRound className="w-4 h-4 text-primary" />,
                  onClick: onOpenPortalAuth,
                },
              ],
            },
          ]
        : []),
      {
        groupLabel: t("groupCauHinh", "Cấu hình"),
        items: [
          {
            label: t("invoiceConfig.customFields", "Cấu hình trường tùy chỉnh"),
            icon: <Settings className="w-4 h-4 text-violet-500" />,
            onClick: () => openCustomFieldsDrawer("INVOICE", "Hóa đơn"),
          },
        ],
      },
    ],
    [
      t,
      canEditInvoice,
      handleExportExcel,
      onOpenPortalAuth,
      openCustomFieldsDrawer,
    ],
  );

  // Sync isFetching with global loading progress bar when active
  const isCurrentTabActive =
    (direction === "IN" && activeTab === "in") ||
    (direction === "OUT" && activeTab === "out");

  useEffect(() => {
    if (isCurrentTabActive && listHook.isFetching) {
      useUIStore.getState().setGlobalLoading(true);
    } else if (isCurrentTabActive && !listHook.isFetching) {
      useUIStore.getState().setGlobalLoading(false);
    }
  }, [isCurrentTabActive, listHook.isFetching]);

  return (
    <SpreadsheetPageTemplate
      hideHeader={isDrawer}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      defaultColumnOrder={["__selection", "__actions", "__expand"]}
      title={
        direction === "IN"
          ? t("inbound", "Hóa đơn mua vào")
          : t("outbound", "Hóa đơn bán ra")
      }
      desc={t("invoiceDesc", "Quản lý danh sách hóa đơn điện tử")}
      icon={<Receipt className="h-5 w-5" />}
      tableId={actualTableId}
      items={listHook.invoices}
      columns={columns}
      getRowKey={(r) => r.id}
      getRowClassName={getInvoiceRowClassName}
      summaryRow={summaryRow}
      loading={listHook.loading}
      isPending={listHook.isFetching}
      emptyLabel={t("emptyData", "Chưa có hóa đơn nào.")}
      minWidth={1200}
      onClearAllFilters={() => {
        listHook.filterPanel.resetAll();
        listHook.setPage(1);
      }}
      listHook={listHook}
      sortArray={
        listHook.sortBy
          ? [
              listHook.sortOrder === "desc"
                ? `-${listHook.sortBy}`
                : listHook.sortBy,
            ]
          : undefined
      }
      onSort={listHook.handleSort}
      page={listHook.page}
      pageSize={listHook.pageSize}
      total={listHook.total}
      totalPages={listHook.totalPages}
      onPage={listHook.setPage}
      onPageSize={listHook.setPageSize}
      onRefresh={() => void listHook.loadInvoices()}
      enableRowSelection={true}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      defaultColumnVisibility={DEFAULT_INVOICE_COLUMN_VISIBILITY}
      bulkActionsNode={bulkActionsNode}
      customActionsNode={viewTabsNode}
      filterConfig={filterConfig}
      filter={listHook.filterPanel}
      rowActions={rowActions}
      onCreate={onOpenSync}
      createLabel={t("syncInvoices", "Đồng bộ")}
      createIcon={<DownloadCloud className="w-4 h-4 mr-1 text-indigo-100" />}
      createActions={createActions}
    />
  );
});
