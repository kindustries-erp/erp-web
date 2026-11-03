export interface VinfastPartsStockExportQuery {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  vehicleType?: string;
  stockTab?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  sorts?: string;
  columnSearch?: string;
  columnFilters?: string;
  /** Key cột Excel cần xuất; bỏ trống = xuất đủ cột */
  selectedColumns?: string[];
}

export interface VinfastPartsStockExportStartResult {
  jobId: string;
  message: string;
  reused?: boolean;
}

export type VinfastPartsStockExportJobStatus =
  | "RUNNING"
  | "COMPLETED"
  | "FAILED";

export interface VinfastPartsStockExportHistoryItem {
  jobId: string;
  fileName: string;
  status: VinfastPartsStockExportJobStatus;
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

export interface VinfastPartsStockExportHistoryResponse {
  items: VinfastPartsStockExportHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface VinfastPartsStockExportProgressEvent {
  processId: "vinfast-parts-stock-xlsx-export" | "ping";
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
