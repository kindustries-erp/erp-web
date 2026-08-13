import { create } from "zustand";

export interface InvoiceExportProgressState {
  jobId?: string;
  fileName?: string;
  current: number;
  total: number;
  isRunning: boolean;
  completed: boolean;
  ready: boolean;
  failed: boolean;
  message?: string;
  sseConnected: boolean;
  lastEventAt?: number;
  setProgress: (
    data: Partial<Omit<InvoiceExportProgressState, "setProgress" | "reset">>,
  ) => void;
  reset: () => void;
}

export const useInvoiceExportProgressStore = create<InvoiceExportProgressState>(
  (set) => ({
    jobId: undefined,
    fileName: undefined,
    current: 0,
    total: 100,
    isRunning: false,
    completed: false,
    ready: false,
    failed: false,
    message: undefined,
    sseConnected: false,
    lastEventAt: undefined,
    setProgress: (data) => set((state) => ({ ...state, ...data })),
    reset: () =>
      set({
        jobId: undefined,
        fileName: undefined,
        current: 0,
        total: 100,
        isRunning: false,
        completed: false,
        ready: false,
        failed: false,
        message: undefined,
        sseConnected: false,
        lastEventAt: undefined,
      }),
  }),
);
