import { create } from "zustand";

export interface GarageTableUiState {
  page: number;
  pageSize?: number;
  dateRanges: Record<string, { from?: string; to?: string }>;
}

const DEFAULT_TABLE_UI_STATE: GarageTableUiState = {
  page: 1,
  pageSize: undefined,
  dateRanges: {},
};

interface GarageState {
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  tableUiState: Record<string, GarageTableUiState>;
  setTablePage: (tableId: string, page: number) => void;
  setTablePageSize: (tableId: string, pageSize: number) => void;
  setTableDateRange: (
    tableId: string,
    key: string,
    from?: string,
    to?: string,
  ) => void;
  resetTableDateRanges: (tableId: string) => void;
}

export const useGarageStore = create<GarageState>((set) => ({
  selectedBranchId: "",
  setSelectedBranchId: (id) => set({ selectedBranchId: id }),
  tableUiState: {},
  setTablePage: (tableId, page) =>
    set((state) => {
      const current = state.tableUiState[tableId] ?? DEFAULT_TABLE_UI_STATE;
      return {
        tableUiState: {
          ...state.tableUiState,
          [tableId]: { ...current, page },
        },
      };
    }),
  setTablePageSize: (tableId, pageSize) =>
    set((state) => {
      const current = state.tableUiState[tableId] ?? DEFAULT_TABLE_UI_STATE;
      return {
        tableUiState: {
          ...state.tableUiState,
          [tableId]: { ...current, pageSize, page: 1 },
        },
      };
    }),
  setTableDateRange: (tableId, key, from, to) =>
    set((state) => {
      const current = state.tableUiState[tableId] ?? DEFAULT_TABLE_UI_STATE;
      return {
        tableUiState: {
          ...state.tableUiState,
          [tableId]: {
            ...current,
            page: 1,
            dateRanges: {
              ...current.dateRanges,
              [key]: { from: from || "", to: to || "" },
            },
          },
        },
      };
    }),
  resetTableDateRanges: (tableId) =>
    set((state) => {
      const current = state.tableUiState[tableId] ?? DEFAULT_TABLE_UI_STATE;
      return {
        tableUiState: {
          ...state.tableUiState,
          [tableId]: { ...current, page: 1, dateRanges: {} },
        },
      };
    }),
}));
