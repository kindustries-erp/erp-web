import { type BulkImportResult } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface XmlImportResultTablesProps {
  result: BulkImportResult;
  onOpenInvoice?: (invoiceId: string) => void;
}
