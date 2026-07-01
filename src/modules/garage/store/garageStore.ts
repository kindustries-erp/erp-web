import { create } from "zustand";

interface GarageState {
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
}

export const useGarageStore = create<GarageState>((set) => ({
  selectedBranchId: "",
  setSelectedBranchId: (id) => set({ selectedBranchId: id }),
}));
