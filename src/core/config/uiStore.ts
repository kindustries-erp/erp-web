import { create } from "zustand";
import { PanelContent } from "@/shared/types";

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export type ToastVariant = "default" | "success" | "destructive";

export interface ToastPayload {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

interface UIState {
  toastMsg: string;
  toastTitle: string;
  toastDescription: string;
  toastVariant: ToastVariant;
  toastVisible: boolean;
  showToast: (toast: string | ToastPayload) => void;
  hideToast: () => void;

  panelOpen: boolean;
  panelContent: PanelContent | null;
  openPanel: (content: PanelContent) => void;
  closePanel: () => void;

  importModalOpen: boolean;
  importSrc: string;
  importFile: File | null;
  openImport: (src: string) => void;
  closeImport: () => void;
  setImportFile: (file: File | null) => void;
  resetShellState: () => void;
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

const shellStateDefaults = {
  panelOpen: false,
  panelContent: null as PanelContent | null,
  importModalOpen: false,
  importSrc: "",
  importFile: null as File | null,
};

export const useUIStore = create<UIState>((set, get) => ({
  toastMsg: "",
  toastTitle: "",
  toastDescription: "",
  toastVariant: "default",
  toastVisible: false,
  showToast: (toast) => {
    if (toastTimer) clearTimeout(toastTimer);
    const payload = typeof toast === "string" ? { title: toast } : toast;
    set({
      toastMsg: payload.title ?? payload.description ?? "",
      toastTitle: payload.title ?? "",
      toastDescription: payload.description ?? "",
      toastVariant: payload.variant ?? "default",
      toastVisible: true,
    });
    toastTimer = setTimeout(() => set({ toastVisible: false }), 3800);
  },
  hideToast: () => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toastVisible: false });
  },

  ...shellStateDefaults,
  openPanel: (content) => set({ panelOpen: true, panelContent: content }),
  closePanel: () => set({ panelOpen: false, panelContent: null }),

  openImport: (src) =>
    set({ importModalOpen: true, importSrc: src, importFile: null }),
  closeImport: () =>
    set({ importModalOpen: false, importSrc: "", importFile: null }),
  setImportFile: (file) => {
    const prev = get().importFile;
    if (prev) URL.revokeObjectURL(prev.name); // cleanup if needed
    set({ importFile: file });
  },
  resetShellState: () => {
    const prev = get().importFile;
    if (prev) URL.revokeObjectURL(prev.name);
    set(shellStateDefaults);
  },

  globalLoading: false,
  setGlobalLoading: (globalLoading) => set({ globalLoading }),
}));
