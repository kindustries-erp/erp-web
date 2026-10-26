import { format, isValid, parseISO } from "date-fns";
import type { V2ExportHistoryItem } from "@/v2/shared/components/molecules/v2-export-history-list";
import type { V2ExportMode } from "@/v2/shared/components/molecules/v2-export-condition-section";
import type {
  BankStatementExportHistoryItem,
  BankStatementExportQuery,
  BankStatementFilterSummaryInput,
} from "../api/dtos/bankStatementExport.dto";

export function toDisplayDate(iso?: string): string {
  if (!iso) return "-";
  const date = parseISO(iso);
  if (!isValid(date)) return "-";
  return format(date, "dd/MM/yyyy HH:mm");
}

export function toDisplayRange(dateFrom?: string, dateTo?: string): string {
  if (!dateFrom && !dateTo) return "-";
  const from = dateFrom ? toDisplayDate(dateFrom).slice(0, 10) : "-";
  const to = dateTo ? toDisplayDate(dateTo).slice(0, 10) : "-";
  return `${from} - ${to}`;
}

export interface BankStatementExportPayloadInput {
  type: "bank" | "cash";
  exportMode: V2ExportMode;
  /** Bộ lọc đang áp dụng trên bảng sao kê */
  baseQuery: Record<string, unknown>;
  dateFrom: string;
  dateTo: string;
  /** Tài khoản đã chọn ở điều kiện xuất; rỗng = tất cả */
  accountId: string;
  transactionType: string;
  selectedColumns: string[];
}

/**
 * "Theo kỳ" ghi đè khoảng ngày và áp dụng tài khoản / loại giao dịch đã chọn.
 * "Theo filter hiện tại" giữ nguyên bộ lọc bảng, bỏ phân trang.
 */
export function buildExportPayload({
  type,
  exportMode,
  baseQuery,
  dateFrom,
  dateTo,
  accountId,
  transactionType,
  selectedColumns,
}: BankStatementExportPayloadInput): BankStatementExportQuery {
  const sourceType = type === "bank" ? "BANK" : "CASH";

  if (exportMode === "by-current-filter") {
    const rest = { ...baseQuery };
    delete rest.page;
    delete rest.pageSize;
    return { ...rest, sourceType, selected_columns: selectedColumns };
  }

  const payload: BankStatementExportQuery = {
    sourceType,
    startDate: `${dateFrom} 00:00:00`,
    endDate: `${dateTo} 23:59:59`,
    selected_columns: selectedColumns,
  };
  if (accountId) {
    if (type === "bank") payload.bankAccountId = accountId;
    else payload.cashBookId = accountId;
  }
  if (transactionType) payload.transactionType = transactionType;
  return payload;
}

export interface BankStatementFilterSummaryLabels {
  accountLabel: string;
  transactionTypeLabel: string;
  branchLabel: string;
  keywordLabel: string;
  allLabel: string;
  noKeyword: string;
}

export interface BankStatementFilterSummary {
  rows: Array<{ label: string; value: string }>;
  filterCount: number;
}

/** Tóm tắt bộ lọc đang xem của bảng sao kê, dùng ở chế độ "Theo filter hiện tại" */
export function buildFilterSummary(
  summary: BankStatementFilterSummaryInput | undefined,
  labels: BankStatementFilterSummaryLabels,
): BankStatementFilterSummary {
  const keyword = summary?.search?.trim();
  return {
    rows: [
      {
        label: labels.accountLabel,
        value: summary?.accountName || labels.allLabel,
      },
      {
        label: labels.transactionTypeLabel,
        value: summary?.transactionType || labels.allLabel,
      },
      {
        label: labels.branchLabel,
        value: summary?.branchName || labels.allLabel,
      },
      { label: labels.keywordLabel, value: keyword || labels.noKeyword },
    ],
    filterCount: summary?.filterCount ?? 0,
  };
}

export interface BankStatementExportHistoryLabels {
  allRange: string;
  statusReady: string;
  statusFailed: string;
  statusRunning: (percent: number) => string;
}

export interface BankStatementExportLiveProgress {
  jobId?: string | null;
  current: number;
  total: number;
}

/** Chuyển dòng lịch sử của server thành dòng hiển thị; ưu tiên tiến độ SSE nếu đúng job */
export function toHistoryViewItem(
  row: BankStatementExportHistoryItem,
  live: BankStatementExportLiveProgress,
  labels: BankStatementExportHistoryLabels,
): V2ExportHistoryItem {
  const base = {
    id: row.jobId,
    fileName: row.fileName,
    periodLabel:
      row.dateFrom || row.dateTo
        ? toDisplayRange(row.dateFrom, row.dateTo)
        : labels.allRange,
    createdAt: toDisplayDate(row.createdAt),
  };

  if (row.status === "COMPLETED") {
    return {
      ...base,
      statusTone: "ready",
      statusLabel: labels.statusReady,
      canDownload: row.canDownload,
    };
  }
  if (row.status === "FAILED") {
    return {
      ...base,
      statusTone: "failed",
      statusLabel: labels.statusFailed,
      canDownload: false,
    };
  }

  const useLive = live.jobId === row.jobId && live.total > 0;
  const current = useLive ? live.current : row.current;
  const total = useLive ? live.total : row.total;
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  return {
    ...base,
    statusTone: "running",
    statusLabel: labels.statusRunning(percent),
    canDownload: false,
  };
}
