import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface ErpInvoicePartnerLinesSectionProps {
  taxCode: string;
  direction?: "IN" | "OUT";
  onPreviewInvoice?: (invoice: ErpInvoice) => void;
}
