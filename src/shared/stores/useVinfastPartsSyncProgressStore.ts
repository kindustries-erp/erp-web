import { create } from "zustand";

export interface VinfastPartsSyncProgressState {
  isSyncing: boolean;
  progress: number;
  logs: string[];
  sseConnected: boolean;
  setSyncing: (val: boolean) => void;
  setProgress: (val: number) => void;
  addLog: (log: string) => void;
  clearLogs: () => void;
  setSseConnected: (val: boolean) => void;
  reset: () => void;
}

export const useVinfastPartsSyncProgressStore =
  create<VinfastPartsSyncProgressState>((set) => ({
    isSyncing: false,
    progress: 0,
    logs: [],
    sseConnected: false,
    setSyncing: (val) => set({ isSyncing: val }),
    setProgress: (val) => set({ progress: val }),
    addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
    clearLogs: () => set({ logs: [], progress: 0 }),
    setSseConnected: (val) => set({ sseConnected: val }),
    reset: () =>
      set({
        isSyncing: false,
        progress: 0,
        logs: [],
        sseConnected: false,
      }),
  }));
