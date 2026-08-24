import React from "react";
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
} from "lucide-react";
import { useAppStore } from "@/core/config/appStore";

import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import {
  getPdfAttachments,
  getInvoiceRowClassName,
  DEFAULT_INVOICE_COLUMN_VISIBILITY,
} from "./utils";
import {
  useErpInvoicesTabLogic,
  type ErpInvoicesTabProps,
} from "./useErpInvoicesTabLogic";
import { InvoiceDrawers } from "./components/InvoiceDrawers";
import { InvoiceBulkModals } from "./components/InvoiceBulkModals";
import { InvoiceViewConfigDrawer } from "./components/InvoiceViewConfigDrawer";

export type { ErpInvoicesTabProps };

export function ErpInvoicesTab(props: ErpInvoicesTabProps) {
  const { openCustomFieldsDrawer } = useAppStore();
  const logic = useErpInvoicesTabLogic(props);
  const {
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
    bulkActionsNode,
    filterConfig,
    activeSortKey,
    activeSortOrder,
    rowSelection,
    setRowSelection,
    selectedIds,
    exportDrawerOpen,
    setExportDrawerOpen,
    portalAuthOpen,
    setPortalAuthOpen,
    importModalOpen,
    setImportModalOpen,
    detailTransactionId,
    setDetailTransactionId,
    previewPdf,
    setPreviewPdf,
    netOffInvoice,
    setNetOffInvoice,
    bulkDrawerOpen,
    setBulkDrawerOpen,
    bulkMonth,
    setBulkMonth,
    bulkTypes,
    setBulkTypes,
    bulkDownloading,
    bulkSelectedTypes,
    setBulkSelectedTypes,
    bulkSelectedDownloading,
    bulkSelectedModalOpen,
    setBulkSelectedModalOpen,
    bulkEditDrawerOpen,
    setBulkEditDrawerOpen,
    bulkPostingModalOpen,
    setBulkPostingModalOpen,
    bulkNetOffDrawerOpen,
    setBulkNetOffDrawerOpen,
    bulkPostingMode,
    selectedPartner,
    partnerDrawerOpen,
    setPartnerDrawerOpen,
    monthOptions,
    branches,
    showToast,
    viewConfigDrawerOpen,
    setViewConfigDrawerOpen,
    editingViewPreset,
    handleSaveViewPreset,
    handleResetViewPreset,
    currentColumnVisibility,
    handleOpenInternal,
    handleCloseInternal,
    handleDownload,
    handleExportExcel,
    buildExportBaseQuery,
    handleBulkDownloadFiles,
    handleBulkDownloadSelected,
  } = logic;

  return (
    <>
      <SpreadsheetPageTemplate
        hideHeader={isDrawer}
        defaultColumnOrder={["__selection", "__actions", "__expand"]}
        title={
          direction === "IN"
            ? t("inbound", "Hóa đơn mua vào")
            : t("outbound", "Hóa đơn bán ra")
        }
        desc={t("invoiceDesc", "Quản lý danh sách hóa đơn điện tử")}
        icon={<Receipt className="h-5 w-5" />}
        tableId={
          isDrawer
            ? `erp-invoices-table-checkpoint-${direction}`
            : `erp-invoices-table-${listDir}`
        }
        items={listHook.invoices}
        columns={columns}
        getRowKey={(r) => r.id}
        getRowClassName={getInvoiceRowClassName}
        summaryRow={summaryRow}
        loading={listHook.loading}
        emptyLabel={t("emptyData", "Chưa có hóa đơn nào.")}
        minWidth={1200}
        activeFilterCount={
          listHook.filterPanel.activeFilterCount +
          (listHook.tableState.activeFilterCount || 0)
        }
        onClearAllFilters={() => {
          listHook.filterPanel.resetAll();
          listHook.setPage(1);
        }}
        sortArray={
          activeSortKey
            ? [activeSortOrder === "desc" ? `-${activeSortKey}` : activeSortKey]
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
        onRowSelectionChange={(updater) =>
          setRowSelection((prev) =>
            typeof updater === "function" ? updater(prev) : updater,
          )
        }
        defaultColumnVisibility={DEFAULT_INVOICE_COLUMN_VISIBILITY}
        bulkActionsNode={bulkActionsNode}
        customActionsNode={viewTabsNode}
        filterConfig={filterConfig}
        filter={listHook.filterPanel}
        rowActions={(inv) => {
          const traCuuItems = [];
          const thaoTacItems = [];

          traCuuItems.push({
            label: t("actionDetail", "Chi tiết hóa đơn"),
            icon: <Eye className="w-3.5 h-3.5" />,
            onClick: () => handleOpenInternal(inv, "view"),
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
                    const blob = await erpInvoicesCoreApi.downloadPdfsZip(
                      inv.id,
                    );
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
        }}
        onCreate={() => setImportModalOpen(true)}
        createLabel={t("syncInvoices", "Đồng bộ")}
        createIcon={<DownloadCloud className="w-4 h-4 mr-1 text-indigo-100" />}
        createActions={[
          {
            groupLabel: t("groupTraCuu", "Tra cứu"),
            items: [
              {
                label: t("exportExcel", "Xuất Excel"),
                icon: <Download className="w-4 h-4 text-green-600" />,
                onClick: () => handleExportExcel(),
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
                      onClick: () => setPortalAuthOpen(true),
                    },
                  ],
                },
              ]
            : []),
          {
            groupLabel: t("groupCauHinh", "Cấu hình"),
            items: [
              {
                label: t(
                  "invoiceConfig.customFields",
                  "Cấu hình trường tùy chỉnh",
                ),
                icon: <Settings className="w-4 h-4 text-violet-500" />,
                onClick: () => openCustomFieldsDrawer("INVOICE", "Hóa đơn"),
              },
            ],
          },
        ]}
      />

      <InvoiceDrawers
        direction={direction}
        isDrawer={isDrawer}
        t={t}
        showToast={showToast}
        formHook={formHook}
        urlSync={urlSync}
        loadInvoices={listHook.loadInvoices}
        handleCloseInternal={handleCloseInternal}
        buildExportBaseQuery={buildExportBaseQuery}
        exportDrawerOpen={exportDrawerOpen}
        setExportDrawerOpen={setExportDrawerOpen}
        portalAuthOpen={portalAuthOpen}
        setPortalAuthOpen={setPortalAuthOpen}
        importModalOpen={importModalOpen}
        setImportModalOpen={setImportModalOpen}
        detailTransactionId={detailTransactionId}
        setDetailTransactionId={setDetailTransactionId}
        previewPdf={previewPdf}
        setPreviewPdf={setPreviewPdf}
        netOffInvoice={netOffInvoice}
        setNetOffInvoice={setNetOffInvoice}
        selectedPartner={selectedPartner}
        partnerDrawerOpen={partnerDrawerOpen}
        setPartnerDrawerOpen={setPartnerDrawerOpen}
      />

      <InvoiceBulkModals
        direction={direction}
        invoices={listHook.invoices || []}
        branches={branches}
        selectedIds={selectedIds}
        setRowSelection={setRowSelection}
        loadInvoices={listHook.loadInvoices}
        bulkSelectedModalOpen={bulkSelectedModalOpen}
        setBulkSelectedModalOpen={setBulkSelectedModalOpen}
        bulkSelectedDownloading={bulkSelectedDownloading}
        bulkSelectedTypes={bulkSelectedTypes}
        setBulkSelectedTypes={setBulkSelectedTypes}
        handleBulkDownloadSelected={handleBulkDownloadSelected}
        bulkDrawerOpen={bulkDrawerOpen}
        setBulkDrawerOpen={setBulkDrawerOpen}
        bulkDownloading={bulkDownloading}
        bulkMonth={bulkMonth}
        setBulkMonth={setBulkMonth}
        bulkTypes={bulkTypes}
        setBulkTypes={setBulkTypes}
        monthOptions={monthOptions}
        handleBulkDownloadFiles={handleBulkDownloadFiles}
        bulkEditDrawerOpen={bulkEditDrawerOpen}
        setBulkEditDrawerOpen={setBulkEditDrawerOpen}
        bulkPostingModalOpen={bulkPostingModalOpen}
        setBulkPostingModalOpen={setBulkPostingModalOpen}
        bulkPostingMode={bulkPostingMode}
        bulkNetOffDrawerOpen={bulkNetOffDrawerOpen}
        setBulkNetOffDrawerOpen={setBulkNetOffDrawerOpen}
      />

      <InvoiceViewConfigDrawer
        open={viewConfigDrawerOpen}
        onClose={() => setViewConfigDrawerOpen(false)}
        preset={editingViewPreset}
        currentColumnVisibility={currentColumnVisibility}
        onSave={handleSaveViewPreset}
        onResetDefault={handleResetViewPreset}
      />
    </>
  );
}
