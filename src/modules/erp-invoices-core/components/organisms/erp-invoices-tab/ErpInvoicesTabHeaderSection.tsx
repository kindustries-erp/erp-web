import React, { useMemo, useEffect, useCallback } from "react";
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
  FileCheck2,
  FileText,
} from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { V2StandardTable } from "@/v2/shared/components/organisms/v2-standard-table";
import { useInvoiceV2Columns } from "./hooks/useInvoiceV2Columns";
import { useInvoiceV2Bridge } from "./hooks/useInvoiceV2Bridge";
import {
  invoiceTotalsToSummary,
  toInvoiceRow,
} from "@/v2/modules/finance-invoice/api/adapters/invoiceRowAdapter";
import type { FakeInvoice } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import { createInvoiceFetchOptions } from "@/v2/modules/finance-invoice/api/queries/useInvoiceColumnOptions";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "@/shared/hooks/useUserPreferences";
import { useUIStore } from "@/core/config/uiStore";
import type { TabItem } from "@/shared/components/PageLayout";
import {
  getPdfAttachments,
  getInvoiceRowClassName,
  DEFAULT_INVOICE_COLUMN_VISIBILITY,
  INVOICE_COLUMN_VIEW_PRESETS,
} from "./utils";
import { InvoiceViewModeCombobox } from "@/modules/erp-invoices-core/components/molecules/invoice-view-mode-combobox";

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
  handleExportPdf: () => void;
  onOpenSync: () => void;
  onOpenSyncAdvanced?: () => void;
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
  handleExportPdf,
  onOpenSync,
  onOpenSyncAdvanced,
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
      <InvoiceViewModeCombobox
        presets={presets || columnViewPresetsHook.presets}
        activePresetKey={effectiveActivePresetKey}
        onSelect={onSelectViewPreset || handleColumnPresetChange}
        onCreateView={onOpenCreateView}
        onEditView={onOpenViewConfig}
        onDeleteView={onDeleteViewPreset}
        filterGroup={{
          title: t("taxCategory", { defaultValue: "Loại hóa đơn thuế" }),
          value: activeTaxPresetKey,
          onChange: handleTaxTabChange,
          items: [
            { value: "all", label: t("tabAll", { defaultValue: "Tất cả" }) },
            { value: "new", label: t("tabNew", { defaultValue: "Mới" }) },
            {
              value: "replacement",
              label: t("tabReplacement", { defaultValue: "Thay thế" }),
            },
            {
              value: "adjustment",
              label: t("tabAdjustment", { defaultValue: "Điều chỉnh" }),
            },
          ],
        }}
      />
    </div>
  ) : undefined;

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
          label: t("actionNetOff", "Đối soát dòng tiền"),
          icon: <Scale className="w-3.5 h-3.5" />,
          onClick: () => handleOpenInternal(inv, "edit", "financials"),
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
              label:
                direction === "IN"
                  ? t("erpInvoices.customFieldsIn", "Cấu hình hóa đơn mua vào")
                  : t("erpInvoices.customFieldsOut", "Cấu hình hóa đơn bán ra"),
              icon: <Settings className="h-[13px] w-[13px]" />,
              onClick: () =>
                openCustomFieldsDrawer(
                  direction === "IN" ? "INVOICE_IN" : "INVOICE_OUT",
                  direction === "IN"
                    ? t("erpInvoices.configTitleIn", "Hóa đơn mua vào")
                    : t("erpInvoices.configTitleOut", "Hóa đơn bán ra"),
                ),
            },
          ],
        },
      ];
    },
    [
      t,
      direction,
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
          {
            label: t("exportPdf", "Xuất PDF"),
            icon: <FileText className="w-4 h-4 text-red-600" />,
            onClick: handleExportPdf,
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
                ...(onOpenSyncAdvanced
                  ? [
                      {
                        label: t(
                          "advancedSyncAndOriginalPdf",
                          "Đồng bộ & Tải PDF gốc NCC",
                        ),
                        icon: (
                          <FileCheck2 className="w-4 h-4 text-emerald-600" />
                        ),
                        onClick: onOpenSyncAdvanced,
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),
      {
        groupLabel: t("groupCauHinh", "Cấu hình"),
        items: [
          {
            label:
              direction === "IN"
                ? t("erpInvoices.customFieldsIn", "Cấu hình hóa đơn mua vào")
                : t("erpInvoices.customFieldsOut", "Cấu hình hóa đơn bán ra"),
            icon: <Settings className="w-4 h-4 text-muted-foreground" />,
            onClick: () =>
              openCustomFieldsDrawer(
                direction === "IN" ? "INVOICE_IN" : "INVOICE_OUT",
                direction === "IN"
                  ? t("erpInvoices.configTitleIn", "Hóa đơn mua vào")
                  : t("erpInvoices.configTitleOut", "Hóa đơn bán ra"),
              ),
          },
        ],
      },
    ],
    [
      t,
      direction,
      canEditInvoice,
      handleExportExcel,
      handleExportPdf,
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

  const bridge = useInvoiceV2Bridge(listHook);

  const v2Items = useMemo(
    () => listHook.invoices.map((inv) => toInvoiceRow(inv, direction)),
    [listHook.invoices, direction],
  );

  const fetchOptions = useMemo(
    () => createInvoiceFetchOptions(direction),
    [direction],
  );

  const selectedKeys = useMemo(
    () => Object.keys(rowSelection).filter((k) => rowSelection[k]),
    [rowSelection],
  );

  const handleSelectionChange = useCallback(
    (keys: string[]) => {
      const next: Record<string, boolean> = {};
      keys.forEach((k) => {
        next[k] = true;
      });
      setRowSelection(next);
    },
    [setRowSelection],
  );

  const v2Columns = useInvoiceV2Columns({
    direction,
    view: (activePresetKey as any) || "overview",
    handleOpenInternal,
    invoices: listHook.invoices,
  });

  // Tổng cộng từ server gắn vào cột có `summary`, khớp key cột (preVatAmount, vatAmount, totalAmount)
  const v2ColumnsWithTotals = useMemo(() => {
    const totals = invoiceTotalsToSummary(listHook.totals);
    return v2Columns.map((column) => {
      const total = totals[column.key as keyof typeof totals];
      return column.summary && total !== undefined
        ? { ...column, summary: { ...column.summary, total } }
        : column;
    });
  }, [v2Columns, listHook.totals]);

  // Bảng V2 trả về dòng FakeInvoice; đổi về dòng API gốc để rowActions/getRowClassName của V1 hoạt động như cũ
  const invoiceById = useMemo(
    () => new Map(listHook.invoices.map((inv) => [inv.id, inv])),
    [listHook.invoices],
  );
  const v2RowActions = useCallback(
    (row: FakeInvoice) => rowActions(invoiceById.get(row.id) ?? row),
    [rowActions, invoiceById],
  );
  const v2RowClassName = useCallback(
    (row: FakeInvoice) =>
      getInvoiceRowClassName(invoiceById.get(row.id) ?? (row as any)),
    [invoiceById],
  );

  const actionGroupNode = useMemo(
    () => (
      <TableActionGroup
        onRefresh={() => void listHook.loadInvoices()}
        loading={listHook.loading}
        onClearAllFilters={bridge.clearAll}
        onCreate={onOpenSync}
        createLabel={t("syncInvoices", "Đồng bộ")}
        createIcon={
          <DownloadCloud className="w-4 h-4 mr-1 text-primary-fg/80" />
        }
        createActions={createActions}
        portalId={actualTableId}
      >
        {viewTabsNode}
        {bulkActionsNode}
      </TableActionGroup>
    ),
    [
      listHook,
      bridge.clearAll,
      onOpenSync,
      t,
      createActions,
      actualTableId,
      viewTabsNode,
      bulkActionsNode,
    ],
  );

  return (
    <PageLayout
      title={
        direction === "IN"
          ? t("inbound", "Hóa đơn mua vào")
          : t("outbound", "Hóa đơn bán ra")
      }
      desc={t("invoiceDesc", "Quản lý danh sách hóa đơn điện tử")}
      icon={<Receipt className="h-5 w-5" />}
      hideHeader={isDrawer}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      actions={actionGroupNode}
    >
      <V2StandardTable
        key={`${direction}-${bridge.tableKey}`}
        tableId={actualTableId}
        items={v2Items}
        columns={v2ColumnsWithTotals}
        getRowKey={(r) => r.id}
        loading={listHook.loading}
        emptyLabel={t("emptyData", "Chưa có hóa đơn nào.")}
        mode="server"
        total={listHook.total}
        initialQuery={bridge.initialQuery}
        onQueryChange={bridge.onQueryChange}
        fetchOptions={fetchOptions}
        preferencesStorage={v2ColumnPreferencesStorage}
        viewPresetStorage={v2ViewPresetStorage}
        enableRowSelection={true}
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        rowActions={v2RowActions}
        getRowClassName={v2RowClassName}
        className="flex-1 min-h-0"
      />
    </PageLayout>
  );
});
