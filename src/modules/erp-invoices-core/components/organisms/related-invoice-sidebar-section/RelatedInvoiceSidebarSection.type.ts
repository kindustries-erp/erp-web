import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface RelatedInvoiceSidebarSectionProps {
  invoice: ErpInvoice | null;
  direction?: "IN" | "OUT";
}
