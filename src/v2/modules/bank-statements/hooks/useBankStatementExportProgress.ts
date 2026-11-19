import {
  useExportJobProgress,
  type ExportJobProgressConfig,
} from "@/v2/core/export-jobs";
import { bankStatementExportApi } from "../api/bankStatementExportApi";
import { useBankStatementExportProgressStore } from "../stores/useBankStatementExportProgressStore";

const CONFIG: ExportJobProgressConfig = {
  streamPath: "/api/v1/bank-transactions-core/export/excel/progress/stream",
  processId: "bank-statement-xlsx-export",
  useStore: useBankStatementExportProgressStore,
  downloadFile: (jobId) => bankStatementExportApi.downloadBackgroundFile(jobId),
  defaultFileName: "sao_ke.xlsx",
  logLabel: "xuất sao kê",
  text: {
    failed: {
      key: "v2.bankStatements.export.progress.failed",
      fallback: "Tạo file thất bại.",
    },
    noJob: {
      key: "v2.bankStatements.export.progress.noJob",
      fallback: "Không có file nào đang sẵn sàng.",
    },
  },
};

/**
 * Nghe tiến độ xuất sao kê qua SSE và cung cấp tải file đã sẵn sàng.
 * Khi token đổi thì kết nối lại.
 */
export const useBankStatementExportProgress = () =>
  useExportJobProgress(CONFIG);
