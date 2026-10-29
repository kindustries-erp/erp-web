import { InvoiceImportSyncDrawer } from "@/modules/erp-invoices-core/components/organisms/invoice-import-sync-drawer";
import { InvoiceSyncAdvancedModal } from "@/modules/erp-invoices-core/components/organisms/invoice-sync-advanced-modal";
import { GdtPortalAuthDrawer } from "@/modules/erp-invoices-core/components/organisms/gdt-portal-auth-drawer";
import { type InvoiceDrawersProps } from "./ErpInvoicesTab.drawers.type";
import { ErpInvoicesTabDetailDrawer } from "./ErpInvoicesTabDetailDrawer";
import { ErpInvoicesTabPreviewDrawers } from "./ErpInvoicesTabPreviewDrawers";

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

      <InvoiceImportSyncDrawer
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        initialDirection={direction}
        onImported={(dir: "IN" | "OUT") => {
          if (dir === direction) {
            void loadInvoices();
          }
        }}
      />

      <GdtPortalAuthDrawer
        open={portalAuthOpen}
        onClose={() => setPortalAuthOpen(false)}
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

      {/* Modal chỉ được mount khi thực sự mở (trước đây kiểm tra nhầm hàm setter) */}
      {syncAdvancedModalOpen && setSyncAdvancedModalOpen && (
        <InvoiceSyncAdvancedModal
          open={syncAdvancedModalOpen}
          onClose={() => setSyncAdvancedModalOpen(false)}
          defaultCompanyTaxCode=""
          onSuccess={() => void loadInvoices()}
        />
      )}
    </>
  );
}
