import type { V2ProgressTone } from "@/v2/shared/components/atoms/v2-progress";
import type {
  V2SyncProgressLabels,
  V2SyncProgressLevel,
  V2SyncProgressStatus,
} from "./V2SyncProgress.type";

const STATUS_TONE: Record<V2SyncProgressStatus, V2ProgressTone> = {
  idle: "primary",
  running: "primary",
  done: "emerald",
  error: "rose",
};

const LEVEL_CLASS: Record<V2SyncProgressLevel, string> = {
  info: "text-slate-100",
  success: "text-emerald-300",
  error: "text-rose-300",
};

export function getSyncProgressTone(
  status: V2SyncProgressStatus,
): V2ProgressTone {
  return STATUS_TONE[status];
}

export function getSyncProgressStatusLabel(
  status: V2SyncProgressStatus,
  labels: V2SyncProgressLabels,
): string | undefined {
  if (status === "running") return labels.running;
  if (status === "done") return labels.done;
  if (status === "error") return labels.error;
  return undefined;
}

/** Hoàn tất thì luôn 100%; chưa chạy thì 0% khi chưa có số liệu */
export function getSyncProgressPercent(
  status: V2SyncProgressStatus,
  progress: number | undefined,
): number | undefined {
  if (status === "done") return 100;
  if (status === "idle") return progress ?? 0;
  return progress;
}

export function getSyncLogClassName(level: V2SyncProgressLevel = "info") {
  return LEVEL_CLASS[level];
}

/** Ghép nội dung dòng nhật ký với hóa đơn đang xử lý: `message — currentItem` */
export function formatSyncLogMessage(
  message: string,
  currentItem?: string,
): string {
  return currentItem ? `${message} — ${currentItem}` : message;
}
