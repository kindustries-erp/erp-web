import { create } from "zustand";

export interface SerialProgressState {
  pendingLines: number;
  pendingSerials: number;
  isRunning: boolean;
  completed: boolean;
  message?: string;
  setProgress: (
    data: Partial<Omit<SerialProgressState, "setProgress">>,
  ) => void;
  reset: () => void;
}

export const useSerialProgressStore = create<SerialProgressState>((set) => ({
  pendingLines: 0,
  pendingSerials: 0,
  isRunning: false,
  completed: false,
  message: undefined,
  setProgress: (data) => set((state) => ({ ...state, ...data })),
  reset: () =>
    set({
      pendingLines: 0,
      pendingSerials: 0,
      isRunning: false,
      completed: false,
      message: undefined,
    }),
}));
