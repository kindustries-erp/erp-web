import { erpInvoicesVi as legacyErpInvoicesVi } from "@/modules/erp-invoices-core/locales/vi";

// TODO: replace with proper English translations for remaining keys.
export const erpInvoicesEn = {
  ...legacyErpInvoicesVi,

  // Sinvoice Draft Sync - toasts & notifications
  "sinvoiceDraft.syncSuccess":
    "Updated: +{{added}} new, -{{removed}} deleted. Total: {{synced}}",
  "sinvoiceDraft.syncFail": "Sync failed",
  "sinvoiceDraft.notifyTitle": "Draft invoices sync completed",
  "sinvoiceDraft.notifyMessage":
    "Viettel draft invoices updated: +{{added}} new, -{{removed}} deleted. Current total: {{syncedCount}} drafts.",
};
