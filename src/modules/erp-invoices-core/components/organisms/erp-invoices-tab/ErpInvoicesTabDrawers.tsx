import { type InvoiceDrawersProps } from "./ErpInvoicesTab.drawers.type";
import { ErpInvoicesTabDetailDrawer } from "./ErpInvoicesTabDetailDrawer";
import { ErpInvoicesTabPreviewDrawers } from "./ErpInvoicesTabPreviewDrawers";
import { ErpInvoicesTabSyncDrawers } from "./ErpInvoicesTabSyncDrawers";

export type { InvoiceDrawersProps } from "./ErpInvoicesTab.drawers.type";

/** Ghép toàn bộ drawer/modal của tab hóa đơn. Mỗi nhóm nằm trong file riêng. */
export function InvoiceDrawers({
  direction,
  t,
  showToast,
  formHook,
  loadInvoices,
  handleCloseInternal,
  buildExportBaseQuery,
  currentFilterSummary,
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
  activeView,
  partnerViewMode,
  syncAdvancedModalOpen,
  setSyncAdvancedModalOpen,
}: InvoiceDrawersProps) {
  return (
    <>
      <ErpInvoicesTabDetailDrawer
        direction={direction}
        formHook={formHook}
        activeView={activeView}
        partnerViewMode={partnerViewMode}
        handleCloseInternal={handleCloseInternal}
        t={t}
      />

      <ErpInvoicesTabSyncDrawers
        direction={direction}
        loadInvoices={loadInvoices}
        importModalOpen={importModalOpen}
        setImportModalOpen={setImportModalOpen}
        portalAuthOpen={portalAuthOpen}
        setPortalAuthOpen={setPortalAuthOpen}
        syncAdvancedModalOpen={syncAdvancedModalOpen}
        setSyncAdvancedModalOpen={setSyncAdvancedModalOpen}
      />

      <ErpInvoicesTabPreviewDrawers
        direction={direction}
        t={t}
        showToast={showToast}
        loadInvoices={loadInvoices}
        buildExportBaseQuery={buildExportBaseQuery}
        currentFilterSummary={currentFilterSummary}
        exportDrawerOpen={exportDrawerOpen}
        setExportDrawerOpen={setExportDrawerOpen}
        detailTransactionId={detailTransactionId}
        setDetailTransactionId={setDetailTransactionId}
        previewPdf={previewPdf}
        setPreviewPdf={setPreviewPdf}
        netOffInvoice={netOffInvoice}
        setNetOffInvoice={setNetOffInvoice}
      />
    </>
  );
}
