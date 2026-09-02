import { create } from "zustand";

export type VehicleStockType = "oto" | "xemay";
export type VinfastStockTab = "ALL" | "IN_STOCK" | "OUT_OF_STOCK" | "NEGATIVE";

export const getDefaultVinfastPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export interface VinfastPartsStockTabState {
  stockTab: VinfastStockTab;
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  selectedSku: string | null;
  catalogData: any | null;
}

const defaultTabState = (
  pageSize = getDefaultVinfastPageSize(),
): VinfastPartsStockTabState => ({
  stockTab: "ALL",
  page: 1,
  pageSize,
  search: "",
  sortBy: "qtyBalance",
  sortOrder: "desc",
  selectedSku: null,
  catalogData: null,
});

export interface VinfastPartsStockStore {
  states: Record<VehicleStockType, VinfastPartsStockTabState>;

  setStockTab: (
    vehicleType: VehicleStockType,
    stockTab: VinfastStockTab,
  ) => void;
  setPage: (
    vehicleType: VehicleStockType,
    pageOrFn: number | ((prev: number) => number),
  ) => void;
  setPageSize: (
    vehicleType: VehicleStockType,
    pageSizeOrFn: number | ((prev: number) => number),
  ) => void;
  setSearch: (vehicleType: VehicleStockType, search: string) => void;
  setSelectedSku: (
    vehicleType: VehicleStockType,
    sku: string | null,
    catalogData?: any | null,
  ) => void;
  resetTabState: (vehicleType: VehicleStockType) => void;
  hydrateFromUrl: (
    vehicleType: VehicleStockType,
    urlState: Partial<VinfastPartsStockTabState>,
  ) => void;
}

export const useVinfastPartsStockStore = create<VinfastPartsStockStore>(
  (set) => ({
    states: {
      oto: defaultTabState(),
      xemay: defaultTabState(),
    },

    setStockTab: (vehicleType, stockTab) =>
      set((state) => ({
        states: {
          ...state.states,
          [vehicleType]: {
            ...state.states[vehicleType],
            stockTab,
            page: 1, // Khi đổi pill tab, reset page về 1
          },
        },
      })),

    setPage: (vehicleType, pageOrFn) =>
      set((state) => {
        const current = state.states[vehicleType];
        const nextPage =
          typeof pageOrFn === "function" ? pageOrFn(current.page) : pageOrFn;
        return {
          states: {
            ...state.states,
            [vehicleType]: {
              ...current,
              page: Math.max(1, nextPage),
            },
          },
        };
      }),

    setPageSize: (vehicleType, pageSizeOrFn) =>
      set((state) => {
        const current = state.states[vehicleType];
        const nextPageSize =
          typeof pageSizeOrFn === "function"
            ? pageSizeOrFn(current.pageSize)
            : pageSizeOrFn;
        return {
          states: {
            ...state.states,
            [vehicleType]: {
              ...current,
              pageSize: nextPageSize,
              page: 1,
            },
          },
        };
      }),

    setSearch: (vehicleType, search) =>
      set((state) => ({
        states: {
          ...state.states,
          [vehicleType]: {
            ...state.states[vehicleType],
            search,
            page: 1,
          },
        },
      })),

    setSelectedSku: (vehicleType, sku, catalogData = null) =>
      set((state) => ({
        states: {
          ...state.states,
          [vehicleType]: {
            ...state.states[vehicleType],
            selectedSku: sku,
            catalogData: sku
              ? (catalogData ?? state.states[vehicleType].catalogData)
              : null,
          },
        },
      })),

    resetTabState: (vehicleType) =>
      set((state) => ({
        states: {
          ...state.states,
          [vehicleType]: defaultTabState(),
        },
      })),

    hydrateFromUrl: (vehicleType, urlState) =>
      set((state) => {
        const current = state.states[vehicleType];
        return {
          states: {
            ...state.states,
            [vehicleType]: {
              ...current,
              ...urlState,
            },
          },
        };
      }),
  }),
);
