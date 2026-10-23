import { create } from "zustand";
import type {
  V2SyncProgressEntry,
  V2SyncProgressLevel,
  V2SyncProgressStatus,
} from "@/v2/shared/components/molecules/v2-sync-progress";
import {
  applyInvoiceSyncEvent,
  type InvoiceSyncEvent,
} from "@/modules/erp-invoices-core/utils/invoiceSyncEvent";

export interface InvoiceSyncProgressState {
  status: V2SyncProgressStatus;
  progress: number;
  logs: V2SyncProgressEntry[];
  currentItem?: string;
  panelVisible: boolean;
  start: (message: string) => void;
  addLog: (message: string, level?: V2SyncProgressLevel) => void;
  fail: (message: string) => void;
  applyEvent: (event: InvoiceSyncEvent) => void;
  setPanelVisible: (visible: boolean) => void;
}

export const useInvoiceSyncProgressStore = create<InvoiceSyncProgressState>(
  (set) => ({
    status: "idle",
    progress: 0,
    logs: [],
    currentItem: undefined,
    panelVisible: false,
    start: (message) =>
      set({
        status: "running",
        progress: 0,
        logs: [{ at: Date.now(), message }],
        currentItem: undefined,
      }),
    addLog: (message, level) =>
      set((state) => ({
        logs: [...state.logs, { at: Date.now(), message, level }],
      })),
    fail: (message) =>
      set((state) => ({
        status: "error",
        currentItem: undefined,
        logs: [...state.logs, { at: Date.now(), message, level: "error" }],
      })),
    applyEvent: (event) =>
      set((state) => applyInvoiceSyncEvent(state, event, Date.now())),
    setPanelVisible: (visible) => set({ panelVisible: visible }),
  }),
);
