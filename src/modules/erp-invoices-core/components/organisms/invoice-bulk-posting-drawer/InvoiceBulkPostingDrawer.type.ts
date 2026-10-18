import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface InvoiceBulkPostingDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedInvoiceIds: string[];
  invoices: ErpInvoice[];
  direction?: "IN" | "OUT";
  mode?: "post" | "unpost";
  onSuccess: () => void;
}

export interface PostInvoiceLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description: string;
}

export type CustomConfig = {
  description: string;
  lines: PostInvoiceLine[];
};
