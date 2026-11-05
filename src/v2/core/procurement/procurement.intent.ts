import { create } from "zustand";

/**
 * Ý định tạo PO từ một PR đã duyệt. PR đặt ý định rồi chuyển trang; trang PO đọc một lần
 * và mở drawer tạo mới điền sẵn từ PR (qua `po-draft`).
 */
interface ProcurementIntentState {
  pendingRequestId: string | null;
  setPendingRequestId: (id: string | null) => void;
}

export const useProcurementIntentStore = create<ProcurementIntentState>()(
  (set) => ({
    pendingRequestId: null,
    setPendingRequestId: (id) => set({ pendingRequestId: id }),
  }),
);

/** Lấy và xóa ý định (đọc một lần). */
export function consumeProcurementRequestIntent(): string | null {
  const id = useProcurementIntentStore.getState().pendingRequestId;
  if (id) useProcurementIntentStore.getState().setPendingRequestId(null);
  return id;
}
