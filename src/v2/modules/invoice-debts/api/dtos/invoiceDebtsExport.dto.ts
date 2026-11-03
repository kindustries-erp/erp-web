export type InvoicePartnerType = "CUSTOMER" | "SUPPLIER";

export interface InvoiceDebtsExportQuery {
  partner_type?: InvoicePartnerType;
  date_from?: string;
  date_to?: string;
  search?: string;
  branch_id?: string;
  column_search?: string;
  column_filters?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  /** Key cột Excel cần xuất; bỏ trống = xuất đủ cột mặc định */
  selectedColumns?: string[];
}

export interface InvoiceDebtExportStartResult {
  jobId: string;
  message: string;
  reused?: boolean;
}

export type InvoiceDebtExportJobStatus = "RUNNING" | "COMPLETED" | "FAILED";

export interface InvoiceDebtExportHistoryItem {
  jobId: string;
  fileName: string;
  status: InvoiceDebtExportJobStatus;
  current: number;
  total: number;
  message: string;
  createdAt: string;
  finishedAt?: string;
  expiresAt?: string;
  dateFrom?: string;
  dateTo?: string;
  partnerType?: string;
  canDownload: boolean;
}

export interface InvoiceDebtExportHistoryResponse {
  items: InvoiceDebtExportHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
