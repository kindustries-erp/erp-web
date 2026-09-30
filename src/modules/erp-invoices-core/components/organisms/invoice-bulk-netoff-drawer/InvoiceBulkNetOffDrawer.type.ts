import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export type BulkSubTabKey = "bank_statement" | "cash_book";
export type BulkViewPreset =
  | "all"
  | "suggestions"
  | "selected"
  | "netted"
  | "unnetted";
export type FocusedViewPreset = "all" | "suggestions" | "selected" | "linked";

export interface InvoiceBulkNetOffDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedInvoiceIds: string[];
  invoices: ErpInvoice[];
  direction?: "IN" | "OUT";
  onSuccess: () => void;
}
