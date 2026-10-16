import { create } from "zustand";

export interface ExportProgressState {
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
    data: Partial<Omit<ExportProgressState, "setProgress" | "reset">>,
  ) => void;
  reset: () => void;
}

const initialState = {
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
};

/** Mỗi luồng xuất (cases, công nợ KH, công nợ NCC) có store tiến độ riêng. */
export function createExportProgressStore() {
  return create<ExportProgressState>((set) => ({
    ...initialState,
    setProgress: (data) => set((state) => ({ ...state, ...data })),
    reset: () => set({ ...initialState }),
  }));
}

export type ExportProgressStore = ReturnType<typeof createExportProgressStore>;
