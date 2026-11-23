import {
  createExportProgressStore,
  type ExportProgressState,
} from "@/v2/core/export-jobs";

export type BankStatementExportProgressState = ExportProgressState;

/** Tiến độ xuất sao kê / sổ quỹ của phiên hiện tại (cập nhật qua SSE) */
export const useBankStatementExportProgressStore = createExportProgressStore();
