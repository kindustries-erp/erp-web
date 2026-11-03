import {
  formatSyncLogMessage,
  type V2SyncProgressEntry,
  type V2SyncProgressLevel,
  type V2SyncProgressStatus,
} from "@/v2/shared/components/molecules/v2-sync-progress";

export interface InvoiceSyncEvent {
  processId: string;
  type?: string;
  total: number;
  current: number;
  message: string;
  completed: boolean;
  /** Hóa đơn đang xử lý, ví dụ `HĐ 1847 · C26MSP · CÔNG TY ABC` */
  currentItem?: string;
}

export interface InvoiceSyncSnapshot {
  status: V2SyncProgressStatus;
  progress: number;
  logs: V2SyncProgressEntry[];
  currentItem?: string;
}

export function isInvoiceSyncKeepAlive(event: InvoiceSyncEvent): boolean {
  return (
    event.processId === "ping" ||
    event.message === "Connected" ||
    event.message === "Ping"
  );
}

export function applyInvoiceSyncEvent(
  state: InvoiceSyncSnapshot,
  event: InvoiceSyncEvent,
  now: number,
): InvoiceSyncSnapshot {
  if (isInvoiceSyncKeepAlive(event)) return state;

  const text = formatSyncLogMessage(event.message, event.currentItem);
  const last = state.logs[state.logs.length - 1];
  const level: V2SyncProgressLevel = event.completed ? "success" : "info";
  // Event trước và sau một hóa đơn dùng chung nội dung nên chỉ ghi một dòng
  const logs =
    last?.message === text
      ? state.logs
      : [...state.logs, { at: now, message: text, level }];
  const currentItem = event.completed
    ? undefined
    : (event.currentItem ?? state.currentItem);

  if (event.completed) {
    return { status: "done", progress: 100, logs, currentItem };
  }

  const progress =
    event.total > 0
      ? Math.min(100, Math.round((event.current / event.total) * 100))
      : state.progress;

  return { status: "running", progress, logs, currentItem };
}
