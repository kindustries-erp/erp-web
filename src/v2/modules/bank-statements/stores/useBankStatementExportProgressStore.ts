import { create } from "zustand";

export interface BankStatementExportProgressState {
  jobId: string | null;
  current: number;
  total: number;
  isRunning: boolean;
  completed: boolean;
  ready: boolean;
  failed: boolean;
  message: string | null;
  fileName: string | null;
  lastEventAt: number | null;
  sseConnected: boolean;

  updateProgress: (data: Partial<BankStatementExportProgressState>) => void;
  resetProgress: () => void;
  setSseConnected: (connected: boolean) => void;
}

const initialState = {
  jobId: null,
  current: 0,
  total: 0,
  isRunning: false,
  completed: false,
  ready: false,
  failed: false,
  message: null,
  fileName: null,
  lastEventAt: null,
  sseConnected: false,
};

/** Tiến độ xuất sao kê / sổ quỹ của phiên hiện tại (cập nhật qua SSE) */
export const useBankStatementExportProgressStore =
  create<BankStatementExportProgressState>((set) => ({
    ...initialState,

    updateProgress: (data) =>
      set((state) => ({ ...state, ...data, lastEventAt: Date.now() })),

    resetProgress: () =>
      set((state) => ({ ...initialState, sseConnected: state.sseConnected })),

    setSseConnected: (connected) => set({ sseConnected: connected }),
  }));
