import { create } from "zustand";

export interface ExportProgressState {
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

  updateProgress: (data: Partial<ExportProgressState>) => void;
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

/** Tạo store tiến độ xuất của một module (cập nhật qua SSE). Mỗi module có một store riêng. */
export const createExportProgressStore = () =>
  create<ExportProgressState>((set) => ({
    ...initialState,

    updateProgress: (data) =>
      set((state) => ({ ...state, ...data, lastEventAt: Date.now() })),

    resetProgress: () =>
      set((state) => ({ ...initialState, sseConnected: state.sseConnected })),

    setSseConnected: (connected) => set({ sseConnected: connected }),
  }));

export type ExportProgressStore = ReturnType<typeof createExportProgressStore>;
