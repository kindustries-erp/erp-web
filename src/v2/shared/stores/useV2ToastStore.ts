import { create } from "zustand";

export type V2ToastVariant = "default" | "success" | "destructive";

export interface V2Toast {
  id: string;
  title: string;
  description?: string;
  variant: V2ToastVariant;
}

export interface V2ToastPayload {
  title: string;
  description?: string;
  variant?: V2ToastVariant;
}

export interface V2ToastState {
  toasts: V2Toast[];
  showToast: (payload: V2ToastPayload) => void;
  dismissToast: (id: string) => void;
}

let sequence = 0;

export const useV2ToastStore = create<V2ToastState>()((set) => ({
  toasts: [],
  showToast: ({ variant = "default", ...payload }) => {
    sequence += 1;
    const toast: V2Toast = { id: `v2-toast-${sequence}`, variant, ...payload };
    set((state) => ({ toasts: [...state.toasts, toast] }));
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
