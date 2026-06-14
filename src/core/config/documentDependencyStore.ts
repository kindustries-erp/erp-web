import { create } from "zustand";

interface DocumentDependencyState {
  isOpen: boolean;
  message: string;
  dependencies: string[];
  openModal: (message: string, dependencies: string[]) => void;
  closeModal: () => void;
}

export const useDocumentDependencyStore = create<DocumentDependencyState>(
  (set) => ({
    isOpen: false,
    message: "",
    dependencies: [],
    openModal: (message, dependencies) =>
      set({ isOpen: true, message, dependencies }),
    closeModal: () => set({ isOpen: false, message: "", dependencies: [] }),
  }),
);
