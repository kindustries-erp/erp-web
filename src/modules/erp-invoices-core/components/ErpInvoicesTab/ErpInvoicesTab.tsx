import React from "react";
import { useAppStore } from "@/core/config/appStore";
import {
  useErpInvoicesTabLogic,
  type ErpInvoicesTabProps,
} from "./useErpInvoicesTabLogic";
import { InvoiceHeaderSection } from "./components/InvoiceHeaderSection";
import { ErpInvoiceItemsSection } from "../ErpInvoiceItemsSection";
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
    canEditInvoice,
    listHook,
    formHook,
    urlSync,
    bulkActionsNode,
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

  // 4-View Lazy Mounted Keep-Alive State
  const [mountedViews, setMountedViews] = React.useState<
    Record<string, boolean>
  >(() => ({
    in: logic.currentTabKey === "in",
    "in-lines": logic.currentTabKey === "in-lines",
    out: logic.currentTabKey === "out",
    "out-lines": logic.currentTabKey === "out-lines",
  }));

  React.useEffect(() => {
    if (logic.currentTabKey && !mountedViews[logic.currentTabKey]) {
      setMountedViews((prev) => ({
        ...prev,
        [logic.currentTabKey]: true,
      }));
    }
  }, [logic.currentTabKey, mountedViews]);

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 w-full overflow-hidden">
      {/* ── View 1: Header IN (Hóa đơn mua vào) ────────────────────────── */}
      {mountedViews["in"] && (
        <div
          className={
            logic.currentTabKey === "in"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <InvoiceHeaderSection
            direction="IN"
            instanceIndex={props.instanceIndex}
            isDrawer={isDrawer}
            partnerTaxCode={props.partnerTaxCode}
            canEditInvoice={canEditInvoice}
            tabs={logic.pageTabs}
            activeTab={logic.currentTabKey}
            onTabChange={logic.handleTabChange}
            handleOpenInternal={handleOpenInternal}
            handleDownload={handleDownload}
            handleExportExcel={() => void handleExportExcel()}
            onOpenSync={() => setImportModalOpen(true)}
            onOpenPortalAuth={() => setPortalAuthOpen(true)}
            setNetOffInvoice={setNetOffInvoice}
            formHook={formHook}
            openCustomFieldsDrawer={openCustomFieldsDrawer}
            showToast={showToast}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            bulkActionsNode={bulkActionsNode}
            onOpenViewConfig={(preset) => {
              logic.handleOpenEditView(preset);
            }}
            onOpenCreateView={() => {
              logic.handleOpenCreateView();
            }}
            onDeleteViewPreset={(key) => {
              logic.handleDeleteViewPreset(key);
            }}
            setPreviewPdf={setPreviewPdf}
            handlePreviewPdf={logic.handlePreviewPdf}
          />
        </div>
      )}

      {/* ── View 2: Lines IN (Chi tiết mua vào) ────────────────────────── */}
      {mountedViews["in-lines"] && (
        <div
          className={
            logic.currentTabKey === "in-lines"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <ErpInvoiceItemsSection
            direction="IN"
            instanceIndex={props.instanceIndex}
            isDrawer={isDrawer}
            canEditInvoice={canEditInvoice}
            partnerTaxCode={props.partnerTaxCode}
            tabs={logic.pageTabs}
            activeTab={logic.currentTabKey}
            onTabChange={logic.handleTabChange}
            handleOpenInternal={handleOpenInternal}
            handleDownload={handleDownload}
            onOpenSync={() => setImportModalOpen(true)}
            onOpenPortalAuth={() => setPortalAuthOpen(true)}
          />
        </div>
      )}

      {/* ── View 3: Header OUT (Hóa đơn bán ra) ────────────────────────── */}
      {mountedViews["out"] && (
        <div
          className={
            logic.currentTabKey === "out"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <InvoiceHeaderSection
            direction="OUT"
            instanceIndex={props.instanceIndex}
            isDrawer={isDrawer}
            partnerTaxCode={props.partnerTaxCode}
            canEditInvoice={canEditInvoice}
            tabs={logic.pageTabs}
            activeTab={logic.currentTabKey}
            onTabChange={logic.handleTabChange}
            handleOpenInternal={handleOpenInternal}
            handleDownload={handleDownload}
            handleExportExcel={() => void handleExportExcel()}
            onOpenSync={() => setImportModalOpen(true)}
            onOpenPortalAuth={() => setPortalAuthOpen(true)}
            setNetOffInvoice={setNetOffInvoice}
            formHook={formHook}
            openCustomFieldsDrawer={openCustomFieldsDrawer}
            showToast={showToast}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            bulkActionsNode={bulkActionsNode}
            onOpenViewConfig={(preset) => {
              logic.handleOpenEditView(preset);
            }}
            onOpenCreateView={() => {
              logic.handleOpenCreateView();
            }}
            onDeleteViewPreset={(key) => {
              logic.handleDeleteViewPreset(key);
            }}
            setPreviewPdf={setPreviewPdf}
            handlePreviewPdf={logic.handlePreviewPdf}
          />
        </div>
      )}

      {/* ── View 4: Lines OUT (Chi tiết bán ra) ────────────────────────── */}
      {mountedViews["out-lines"] && (
        <div
          className={
            logic.currentTabKey === "out-lines"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <ErpInvoiceItemsSection
            direction="OUT"
            instanceIndex={props.instanceIndex}
            isDrawer={isDrawer}
            canEditInvoice={canEditInvoice}
            partnerTaxCode={props.partnerTaxCode}
            tabs={logic.pageTabs}
            activeTab={logic.currentTabKey}
            onTabChange={logic.handleTabChange}
            handleOpenInternal={handleOpenInternal}
            handleDownload={handleDownload}
            onOpenSync={() => setImportModalOpen(true)}
            onOpenPortalAuth={() => setPortalAuthOpen(true)}
          />
        </div>
      )}

      {/* ── Common Drawers & Modals (Shared across views) ──────────────── */}
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
        activeView={logic.activeView}
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
    </div>
  );
}
