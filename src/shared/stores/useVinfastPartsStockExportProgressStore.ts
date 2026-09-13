import { create } from "zustand";

interface VinfastPartsStockExportProgressState {
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

  updateProgress: (data: Partial<VinfastPartsStockExportProgressState>) => void;
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

export const useVinfastPartsStockExportProgressStore =
  create<VinfastPartsStockExportProgressState>((set) => ({
    ...initialState,

    updateProgress: (data) =>
      set((state) => ({
        ...state,
        ...data,
        lastEventAt: Date.now(),
      })),

    resetProgress: () =>
      set((state) => ({
        ...initialState,
        sseConnected: state.sseConnected,
      })),

    setSseConnected: (connected) => set({ sseConnected: connected }),
  }));
