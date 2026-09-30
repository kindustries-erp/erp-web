import type { BulkImportResult } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface XmlImportResultSummaryProps {
  result: BulkImportResult;
}

export type ImportResultSummaryProps = XmlImportResultSummaryProps;
