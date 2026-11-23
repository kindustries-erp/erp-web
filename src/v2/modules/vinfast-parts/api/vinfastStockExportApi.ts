import { createExportJobApi } from "@/v2/core/export-jobs";
import type {
  VinfastPartsStockExportHistoryResponse,
  VinfastPartsStockExportQuery,
  VinfastPartsStockExportStartResult,
} from "./dtos/vinfastStockExport.dto";

export const vinfastStockExportApi = createExportJobApi<
  VinfastPartsStockExportQuery,
  VinfastPartsStockExportStartResult,
  VinfastPartsStockExportHistoryResponse
>("/api/v1/vinfast-parts/stock/export/excel/background");
