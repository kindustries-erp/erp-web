import type {
  V2SyncProgressLevel,
  V2SyncProgressStatus,
} from "@/v2/shared/components/molecules/v2-sync-progress";

/**
 * Trạng thái lượt đồng bộ phụ tùng VinFast do API trả về (GET /vinfast-parts/sync/status).
 */
export interface VinfastSyncStatus {
  running: boolean;
  /** Hóa đơn / dòng đang xử lý; API bản cũ có thể không trả về */
  currentItem?: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  phase: string | null;
  current: number;
  total: number;
  message: string | null;
  lastError: string | null;
}

export interface SyncStatusUpdate {
  isSyncing: boolean;
  progress?: number;
  logMessage?: string;
  currentItem?: string;
}

/**
 * Đối chiếu trạng thái từ API với trạng thái đang hiển thị trên drawer.
 * - Đang chạy (kể cả do người khác khởi động): gắn lại tiến trình.
 * - Vừa kết thúc khi drawer đang theo dõi: tắt trạng thái đồng bộ và ghi kết quả.
 */
export function reconcileSyncStatus(
  status: VinfastSyncStatus,
  isSyncing: boolean,
  lastLog: string | undefined,
): SyncStatusUpdate {
  if (status.running) {
    const progress =
      status.total > 0
        ? Math.round((status.current / status.total) * 100)
        : undefined;
    const message = status.message ?? undefined;
    return {
      isSyncing: true,
      progress,
      logMessage: message && message !== lastLog ? message : undefined,
      currentItem: status.currentItem ?? undefined,
    };
  }
  if (isSyncing && status.finishedAt) {
    return {
      isSyncing: false,
      progress: 100,
      logMessage: status.lastError
        ? `Lỗi: ${status.lastError}`
        : "Hoàn tất đồng bộ.",
    };
  }
  return { isSyncing };
}

/**
 * Trạng thái hiển thị của panel tiến trình: đang chạy > lỗi (dòng cuối) > hoàn tất (100%) > chưa chạy.
 */
export function deriveSyncPanelStatus(
  isSyncing: boolean,
  progress: number,
  lastLevel: V2SyncProgressLevel | undefined,
): V2SyncProgressStatus {
  if (isSyncing) return "running";
  if (lastLevel === "error") return "error";
  if (progress === 100) return "done";
  return "idle";
}
