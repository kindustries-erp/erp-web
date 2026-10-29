export type BankStatementExportSourceType = "BANK" | "CASH";

export interface BankStatementExportQuery {
  sourceType: BankStatementExportSourceType;
  /** Khoảng ngày theo kỳ (chế độ "Theo kỳ") */
  startDate?: string;
  endDate?: string;
  bankAccountId?: string;
  cashBookId?: string;
  transactionType?: string;
  /** Key cột Excel cần xuất */
  selected_columns?: string[];
  /** Bộ lọc bảng đang xem (chế độ "Theo filter hiện tại") */
  [filter: string]: unknown;
}

export interface BankStatementExportStartResult {
  jobId: string;
  message: string;
  reused?: boolean;
}

export type BankStatementExportJobStatus = "RUNNING" | "COMPLETED" | "FAILED";

export interface BankStatementExportHistoryItem {
  jobId: string;
  fileName: string;
  status: BankStatementExportJobStatus;
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

export interface BankStatementExportHistoryResponse {
  items: BankStatementExportHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BankStatementExportProgressEvent {
  processId: "bank-statement-xlsx-export" | "ping";
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

/** Tài khoản ngân hàng hoặc sổ quỹ để chọn trong điều kiện xuất */
export interface BankStatementExportAccount {
  id: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  name?: string;
}

/** Tóm tắt bộ lọc bảng sao kê đang xem, hiển thị ở chế độ "Theo filter hiện tại" */
export interface BankStatementFilterSummaryInput {
  search?: string;
  accountName?: string;
  transactionType?: string;
  branchName?: string;
  filterCount?: number;
}
