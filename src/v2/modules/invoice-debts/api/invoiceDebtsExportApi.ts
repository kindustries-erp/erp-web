import { createExportJobApi } from "@/v2/core/export-jobs";
import type {
  InvoiceDebtExportHistoryResponse,
  InvoiceDebtExportStartResult,
  InvoiceDebtsExportQuery,
} from "./dtos/invoiceDebtsExport.dto";

export { readBlobErrorMessage } from "@/v2/core/export-jobs";

export const invoiceDebtsExportApi = createExportJobApi<
  InvoiceDebtsExportQuery,
  InvoiceDebtExportStartResult,
  InvoiceDebtExportHistoryResponse
>("/api/v1/erp-invoices/debts/export/excel/background");
