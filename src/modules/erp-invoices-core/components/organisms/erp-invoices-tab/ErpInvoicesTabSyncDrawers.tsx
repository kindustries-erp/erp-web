import { useCallback } from "react";
import { InvoiceImportSyncDrawer } from "@/modules/erp-invoices-core/components/organisms/invoice-import-sync-drawer";
import { InvoiceSyncAdvancedModal } from "@/modules/erp-invoices-core/components/organisms/invoice-sync-advanced-modal";
import { GdtPortalAuthDrawer } from "@/modules/erp-invoices-core/components/organisms/gdt-portal-auth-drawer";
import { InvoiceXmlImportModal } from "@/modules/erp-invoices-core/components/organisms/invoice-xml-import-modal";
import { InvoiceDetailWrapper } from "@/modules/erp-invoices-core/components/organisms/invoice-detail-wrapper";
import { XmlImportResultTables } from "@/modules/erp-invoices-core/components/organisms/xml-import-result-tables";
import type { InvoiceDrawersProps } from "./ErpInvoicesTab.drawers.type";

type SyncDrawersProps = Pick<
  InvoiceDrawersProps,
  | "direction"
  | "loadInvoices"
  | "importModalOpen"
  | "setImportModalOpen"
  | "portalAuthOpen"
  | "setPortalAuthOpen"
  | "syncAdvancedModalOpen"
  | "setSyncAdvancedModalOpen"
>;

/** Drawer/modal đồng bộ hóa đơn của tab. Chỉ mount MỘT GdtPortalAuthDrawer; các modal con đi qua slot. */
export function ErpInvoicesTabSyncDrawers({
  direction,
  loadInvoices,
  importModalOpen,
  setImportModalOpen,
  portalAuthOpen,
  setPortalAuthOpen,
  syncAdvancedModalOpen,
  setSyncAdvancedModalOpen,
}: SyncDrawersProps) {
  const openPortalAuth = useCallback(
    () => setPortalAuthOpen(true),
    [setPortalAuthOpen],
  );

  return (
    <>
      <InvoiceImportSyncDrawer
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        initialDirection={direction}
        onOpenLogin={openPortalAuth}
        onImported={(dir) => {
          if (dir === direction) void loadInvoices();
        }}
        renderXmlPreview={(props) => <InvoiceXmlImportModal {...props} />}
        renderXmlResultTables={(props) => <XmlImportResultTables {...props} />}
        renderInvoiceDetail={(props) => (
          <InvoiceDetailWrapper
            invoiceId={props.invoiceId}
            onClose={props.onClose}
          />
        )}
      />

      <GdtPortalAuthDrawer
        open={portalAuthOpen}
        onClose={() => setPortalAuthOpen(false)}
      />

      {/* Modal chỉ được mount khi thực sự mở */}
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
