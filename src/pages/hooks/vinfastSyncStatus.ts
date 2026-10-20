/**
 * Trạng thái lượt đồng bộ phụ tùng VinFast do API trả về (GET /vinfast-parts/sync/status).
 */
export interface VinfastSyncStatus {
  running: boolean;
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
