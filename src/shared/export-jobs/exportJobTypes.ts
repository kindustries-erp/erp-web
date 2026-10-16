export type ExportJobStatus = "RUNNING" | "COMPLETED" | "FAILED";

export interface ExportProgressEvent {
  processId: string;
  userId?: string;
  jobId?: string;
  current: number;
  total: number;
  isRunning: boolean;
  completed: boolean;
  ready: boolean;
  failed: boolean;
  message?: string;
  fileName?: string;
}

export interface ExportHistoryItem {
  jobId: string;
  fileName: string;
  status: ExportJobStatus;
  current: number;
  total: number;
  message: string;
  createdAt: string;
  finishedAt?: string;
  expiresAt?: string;
  dateFrom?: string;
  dateTo?: string;
  canDownload: boolean;
}

export interface ExportHistoryResult {
  items: ExportHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ExportStartResult {
  jobId: string;
  message: string;
  reused?: boolean;
}

/** Cấu hình một luồng xuất nền (đường dẫn API tương đối với `API_BASE_URL`). */
export interface ExportJobScope {
  /** Khóa duy nhất, dùng làm queryKey/tableId. */
  key: string;
  startPath: string;
  historyPath: string;
  streamPath: string;
  downloadPath: (jobId: string) => string;
}
