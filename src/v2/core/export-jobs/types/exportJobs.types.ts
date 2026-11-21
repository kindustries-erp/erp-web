/** Sự kiện tiến độ SSE của job xuất nền. Khớp `ExportProgressEvent` bên API, không đổi field. */
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

export type ExportJobStatus = "RUNNING" | "COMPLETED" | "FAILED";

export interface ExportStartResult {
  jobId: string;
  message: string;
  reused?: boolean;
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

export interface ExportHistoryResponse<
  TItem extends ExportHistoryItem = ExportHistoryItem,
> {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
