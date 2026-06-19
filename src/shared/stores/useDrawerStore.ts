import { create } from "zustand";

export type DrawerMode = "create" | "view" | "edit";

interface DrawerState {
  isOpen: boolean;
  type: string | null;
  mode: DrawerMode;
  entityId: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entityData: any | null;
  openDrawer: (
    type: string,
    mode: DrawerMode,
    id?: string | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any,
  ) => void;
  closeDrawer: () => void;
  setMode: (mode: DrawerMode) => void;
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  type: null,
  mode: "view",
  entityId: null,
  entityData: null,
  openDrawer: (type, mode, id = null, data = null) =>
    set({
      isOpen: true,
      type,
      mode,
      entityId: id,
      entityData: data,
    }),
  closeDrawer: () =>
    set({
      isOpen: false,
      type: null,
      entityId: null,
      entityData: null,
    }),
  setMode: (mode) => set({ mode }),
}));
