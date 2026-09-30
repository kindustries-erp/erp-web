import type { ErpInvoiceListParams } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface InvoiceExportDrawerProps {
  open: boolean;
  onClose: () => void;
  direction: "IN" | "OUT";
  buildBaseQuery: () => Partial<ErpInvoiceListParams>;
}
