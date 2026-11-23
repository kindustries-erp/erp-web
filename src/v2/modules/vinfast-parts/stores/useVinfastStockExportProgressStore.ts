import {
  createExportProgressStore,
  type ExportProgressState,
} from "@/v2/core/export-jobs";

export type VinfastStockExportProgressState = ExportProgressState;

/** Tiến độ xuất Excel tồn kho Vinfast của phiên hiện tại (cập nhật qua SSE) */
export const useVinfastStockExportProgressStore = createExportProgressStore();
