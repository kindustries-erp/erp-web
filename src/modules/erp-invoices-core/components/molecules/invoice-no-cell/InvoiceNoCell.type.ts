import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface InvoiceNoCellProps {
  inv: ErpInvoice;
  handleOpenInternal: (inv: any, mode?: "view" | "edit") => void;
}
