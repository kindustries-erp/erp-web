import { format, isValid, parseISO } from "date-fns";
import { PERIOD_OPTS } from "@/modules/finance/utils/financeHelpers";
import type { VinfastPartsStockExportHistoryItem } from "@/pages/api/vinfastPartsStockExportApi";
import type { V2ComboboxOption } from "@/v2/shared/components/molecules/v2-combobox";
import type { V2ExportHistoryItem } from "@/v2/shared/components/molecules/v2-export-history-list";

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

export interface VinfastExportPeriodLabels {
  allRange: string;
  customRange: string;
}

/** Tùy chọn kỳ: "Tất cả", 24 tháng gần nhất, "Tùy chỉnh" */
export function buildPeriodOptions(
  labels: VinfastExportPeriodLabels,
): V2ComboboxOption[] {
  return [
    { value: "all", label: labels.allRange },
    ...PERIOD_OPTS,
    { value: "custom", label: labels.customRange },
  ];
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
