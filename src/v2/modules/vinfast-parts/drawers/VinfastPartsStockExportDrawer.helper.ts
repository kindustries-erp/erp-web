import { format, isValid, parseISO } from "date-fns";
import type {
  VinfastPartsStockExportHistoryItem,
  VinfastPartsStockExportQuery,
} from "@/pages/api/vinfastPartsStockExportApi";
import type { V2ExportHistoryItem } from "@/v2/shared/components/molecules/v2-export-history-list";
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

export interface VinfastExportPayloadInput {
  exportMode: V2ExportMode;
  /** Bộ lọc đang áp dụng trên bảng (vehicleType, search, columnFilters...) */
  baseQuery: Partial<VinfastPartsStockExportQuery>;
  dateFrom: string;
  dateTo: string;
  selectedColumns: string[];
}

/**
 * "Theo kỳ" ghi đè khoảng ngày bằng kỳ đã chọn.
 * "Theo filter hiện tại" giữ nguyên bộ lọc bảng, không ghi đè ngày.
 */
export function buildExportPayload({
  exportMode,
  baseQuery,
  dateFrom,
  dateTo,
  selectedColumns,
}: VinfastExportPayloadInput): VinfastPartsStockExportQuery {
  if (exportMode === "by-current-filter") {
    return { ...baseQuery, selectedColumns };
  }
  return { ...baseQuery, dateFrom, dateTo, selectedColumns };
}

export interface VinfastFilterSummaryLabels {
  vehicleTypeAll: string;
  vehicleTypeCar: string;
  vehicleTypeMotorbike: string;
  noKeyword: string;
  keywordLabel: string;
  vehicleTypeLabel: string;
}

export interface VinfastFilterSummary {
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
  baseQuery: Partial<VinfastPartsStockExportQuery>,
  labels: VinfastFilterSummaryLabels,
): VinfastFilterSummary {
  const vehicleValue =
    baseQuery.vehicleType === "oto" || baseQuery.vehicleType === "CAR"
      ? labels.vehicleTypeCar
      : baseQuery.vehicleType === "xemay" ||
          baseQuery.vehicleType === "MOTORBIKE"
        ? labels.vehicleTypeMotorbike
        : labels.vehicleTypeAll;

  const keyword = baseQuery.search?.trim();
  const columnFilterCount = countActiveColumnFilters(baseQuery.columnFilters);
  const filterCount = columnFilterCount + (keyword ? 1 : 0);

  return {
    rows: [
      { label: labels.vehicleTypeLabel, value: vehicleValue },
      { label: labels.keywordLabel, value: keyword || labels.noKeyword },
    ],
    filterCount,
  };
}

export interface VinfastExportHistoryLabels {
  allRange: string;
  statusReady: string;
  statusFailed: string;
  statusRunning: (percent: number) => string;
}

export interface VinfastExportLiveProgress {
  jobId?: string | null;
  current: number;
  total: number;
}

/** Chuyển dòng lịch sử của server thành dòng hiển thị; ưu tiên tiến độ SSE nếu đúng job */
export function toHistoryViewItem(
  row: VinfastPartsStockExportHistoryItem,
  live: VinfastExportLiveProgress,
  labels: VinfastExportHistoryLabels,
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
