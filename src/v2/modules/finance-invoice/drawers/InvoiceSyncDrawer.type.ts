import type { ReactNode } from "react";
import type { DrawerAction } from "@/v2/shared/components/molecules/v2-drawer-footer";
import type {
  V2SyncProgressEntry,
  V2SyncProgressStatus,
} from "@/v2/shared/components/molecules/v2-sync-progress";
import type { InvoiceSyncPeriodState } from "./InvoiceSyncDrawer.period.hook";

export type InvoiceSyncDirection = "IN" | "OUT";
export type InvoiceSyncMethod = "GDT" | "XML";

export interface InvoiceSyncProgressView {
  status: V2SyncProgressStatus;
  progress: number;
  currentItem?: string;
  logs: V2SyncProgressEntry[];
}

/**
 * Props thuần trình bày của drawer đồng bộ hóa đơn (v2).
 * Logic, API và SSE do container V1 cung cấp; phần dialog V1 và kết quả V1 truyền qua slot.
 */
export interface InvoiceSyncDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Có file XML chưa import: hỏi xác nhận trước khi đóng */
  confirmOnClose: boolean;

  direction: InvoiceSyncDirection;
  onDirectionChange: (direction: InvoiceSyncDirection) => void;
  method: InvoiceSyncMethod;
  onMethodChange: (method: InvoiceSyncMethod) => void;

  period: InvoiceSyncPeriodState;
  canEditInvoice: boolean;
  noCredential: boolean;
  syncing: boolean;
  onOpenLogin: () => void;
  onSync: () => void;

  progress: InvoiceSyncProgressView;
  /** Kết quả đồng bộ GDT (component V1, truyền qua slot) */
  gdtResult?: ReactNode;
  /** Luồng tải file XML (component V1, truyền qua slot) */
  xmlPanel?: ReactNode;

  actions: DrawerAction[];
}
