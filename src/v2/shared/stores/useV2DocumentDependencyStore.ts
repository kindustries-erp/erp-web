import { create } from "zustand";

export interface V2DocumentDependencyState {
  isOpen: boolean;
  message: string;
  dependencies: string[];
  openModal: (message: string, dependencies: string[]) => void;
  closeModal: () => void;
}

/** Mở khi API trả 409 `DOCUMENT_IN_USE`: chứng từ đang được tham chiếu nên không thể hủy/xóa */
export const useV2DocumentDependencyStore = create<V2DocumentDependencyState>()(
  (set) => ({
    isOpen: false,
    message: "",
    dependencies: [],
    openModal: (message, dependencies) =>
      set({ isOpen: true, message, dependencies }),
    closeModal: () => set({ isOpen: false, message: "", dependencies: [] }),
  }),
);
