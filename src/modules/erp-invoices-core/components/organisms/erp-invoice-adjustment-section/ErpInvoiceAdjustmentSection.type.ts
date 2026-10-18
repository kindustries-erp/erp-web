import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface ErpInvoiceAdjustmentSectionProps {
  invoice: ErpInvoice | null;
  direction?: "IN" | "OUT";
  className?: string;
}
