import { format, isValid, parseISO } from "date-fns";
import type {
  InvoiceDebtExportHistoryItem,
  InvoiceDebtsExportQuery,
  InvoicePartnerType,
} from "../api/dtos/invoiceDebtsExport.dto";
import type {
  V2ExportHistoryItem,
  V2ExportHistoryTone,
} from "@/v2/shared/components/molecules/v2-export-history-list";
import type { V2ExportMode } from "@/v2/shared/components/molecules/v2-export-condition-section";

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

export interface InvoiceDebtsExportPayloadInput {
  exportMode: V2ExportMode;
  baseQuery: Partial<InvoiceDebtsExportQuery>;
  partnerType?: InvoicePartnerType;
  dateFrom: string;
  dateTo: string;
  selectedColumns: string[];
}

/**
 * "by-period" ghi đè khoảng ngày bằng kỳ đã chọn.
 * "by-current-filter" giữ nguyên bộ lọc bảng.
 * partnerType luôn được ưu tiên nếu người dùng chủ động chọn trên drawer tab.
 */
export function buildExportPayload({
  exportMode,
  baseQuery,
  partnerType,
  dateFrom,
  dateTo,
  selectedColumns,
}: InvoiceDebtsExportPayloadInput): InvoiceDebtsExportQuery {
  const effectivePartnerType = partnerType ?? baseQuery.partner_type;

  if (exportMode === "by-current-filter") {
    return {
      ...baseQuery,
      partner_type: effectivePartnerType,
      selectedColumns,
    };
  }

  return {
    ...baseQuery,
    partner_type: effectivePartnerType,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    selectedColumns,
  };
}

export interface InvoiceDebtsFilterSummaryLabels {
  partnerAll: string;
  partnerCustomer: string;
  partnerSupplier: string;
  noKeyword: string;
  keywordLabel: string;
  partnerTypeLabel: string;
}

export interface InvoiceDebtsFilterSummary {
  rows: Array<{ label: string; value: string }>;
  filterCount: number;
}

function countActiveColumnFilters(raw?: string): number {
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.values(parsed).filter((value) =>
      Array.isArray(value) ? value.length > 0 : Boolean(value),
    ).length;
  } catch {
    return 0;
  }
}

/** Tóm tắt bộ lọc bảng để hiển thị ở chế độ "Theo filter hiện tại" */
export function buildFilterSummary(
  baseQuery: Partial<InvoiceDebtsExportQuery>,
  partnerType: InvoicePartnerType | undefined,
  labels: InvoiceDebtsFilterSummaryLabels,
): InvoiceDebtsFilterSummary {
  const currentPartner = partnerType ?? baseQuery.partner_type;
  const partnerValue =
    currentPartner === "CUSTOMER"
      ? labels.partnerCustomer
      : currentPartner === "SUPPLIER"
        ? labels.partnerSupplier
        : labels.partnerAll;

  const keyword = baseQuery.search?.trim();
  const columnFilterCount =
    countActiveColumnFilters(baseQuery.column_filters) +
    countActiveColumnFilters(baseQuery.column_search);
  const filterCount =
    columnFilterCount + (keyword ? 1 : 0) + (currentPartner ? 1 : 0);

  return {
    rows: [
      { label: labels.partnerTypeLabel, value: partnerValue },
      { label: labels.keywordLabel, value: keyword || labels.noKeyword },
    ],
    filterCount,
  };
}

export interface InvoiceDebtsHistoryLabels {
  allRange: string;
  statusReady: string;
  statusFailed: string;
  statusRunning: (percent: number) => string;
}

export function toHistoryViewItem(
  row: InvoiceDebtExportHistoryItem,
  labels: InvoiceDebtsHistoryLabels,
): V2ExportHistoryItem {
  let statusTone: V2ExportHistoryTone;
  let statusLabel: string;

  if (row.status === "COMPLETED") {
    statusTone = "ready";
    statusLabel = labels.statusReady;
  } else if (row.status === "FAILED") {
    statusTone = "failed";
    statusLabel = row.message || labels.statusFailed;
  } else {
    const percent =
      row.total > 0 ? Math.round((row.current / row.total) * 100) : 0;
    statusTone = "running";
    statusLabel = labels.statusRunning(percent);
  }

  const periodLabel =
    row.dateFrom || row.dateTo
      ? toDisplayRange(row.dateFrom, row.dateTo)
      : labels.allRange;

  return {
    id: row.jobId,
    fileName: row.fileName,
    periodLabel,
    createdAt: toDisplayDate(row.createdAt),
    statusTone,
    statusLabel,
    canDownload: Boolean(row.canDownload),
  };
}
