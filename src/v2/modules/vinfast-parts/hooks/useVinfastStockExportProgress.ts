import {
  useExportJobProgress,
  type ExportJobProgressConfig,
} from "@/v2/core/export-jobs";
import { vinfastStockExportApi } from "../api/vinfastStockExportApi";
import { useVinfastStockExportProgressStore } from "../stores/useVinfastStockExportProgressStore";

const CONFIG: ExportJobProgressConfig = {
  streamPath: "/api/v1/vinfast-parts/stock/export/excel/progress/stream",
  processId: "vinfast-parts-stock-xlsx-export",
  useStore: useVinfastStockExportProgressStore,
  downloadFile: (jobId) => vinfastStockExportApi.downloadBackgroundFile(jobId),
  defaultFileName: "vinfast-parts-stock.xlsx",
  logLabel: "xuất Excel Vinfast",
  text: {
    failed: {
      key: "v2.vinfastParts.export.progress.failed",
      fallback: "Tạo file thất bại.",
    },
    ready: {
      key: "v2.vinfastParts.export.progress.ready",
      fallback: "File đã sẵn sàng. Có thể tải xuống.",
    },
    noJob: {
      key: "v2.vinfastParts.export.progress.noJob",
      fallback: "Không có file nào đang sẵn sàng.",
    },
  },
};

/**
 * Nghe tiến độ xuất Excel qua SSE và cung cấp tải file đã sẵn sàng.
 * Chỉ mount một lần cho mỗi drawer; khi token đổi thì kết nối lại.
 */
export const useVinfastStockExportProgress = () => useExportJobProgress(CONFIG);
