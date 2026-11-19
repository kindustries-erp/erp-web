import { createExportJobApi } from "@/v2/core/export-jobs";
import type {
  BankStatementExportHistoryResponse,
  BankStatementExportQuery,
  BankStatementExportStartResult,
} from "./dtos/bankStatementExport.dto";

export const bankStatementExportApi = createExportJobApi<
  BankStatementExportQuery,
  BankStatementExportStartResult,
  BankStatementExportHistoryResponse
>("/api/v1/bank-transactions-core/export/excel/background");
