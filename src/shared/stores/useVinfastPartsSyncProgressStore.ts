import { create } from "zustand";
import type {
  V2SyncProgressEntry,
  V2SyncProgressLevel,
} from "@/v2/shared/components/molecules/v2-sync-progress";

export interface VinfastPartsSyncProgressState {
  isSyncing: boolean;
  progress: number;
  /** Hóa đơn / dòng đang xử lý */
  currentItem?: string;
  logs: V2SyncProgressEntry[];
  sseConnected: boolean;
  setSyncing: (val: boolean) => void;
  setProgress: (val: number) => void;
  setCurrentItem: (val: string | undefined) => void;
  addLog: (log: string, level?: V2SyncProgressLevel) => void;
  clearLogs: () => void;
  setSseConnected: (val: boolean) => void;
  reset: () => void;
}

export const useVinfastPartsSyncProgressStore =
  create<VinfastPartsSyncProgressState>((set) => ({
    isSyncing: false,
    progress: 0,
    currentItem: undefined,
    logs: [],
    sseConnected: false,
    setSyncing: (val) => set({ isSyncing: val }),
    setProgress: (val) => set({ progress: val }),
    setCurrentItem: (val) => set({ currentItem: val }),
    addLog: (log, level) =>
      set((state) => ({
        logs: [...state.logs, { at: Date.now(), message: log, level }],
      })),
    clearLogs: () => set({ logs: [], progress: 0, currentItem: undefined }),
    setSseConnected: (val) => set({ sseConnected: val }),
    reset: () =>
      set({
        isSyncing: false,
        progress: 0,
        logs: [],
        sseConnected: false,
      }),
  }));
