import { create } from "zustand";
import {
  periodFirstDay,
  periodLastDay,
} from "@/modules/finance/utils/financeHelpers";

export type Direction =
  | "IN"
  | "OUT"
  | "IN_2"
  | "OUT_2"
  | "CHECKPOINT_IN"
  | "CHECKPOINT_OUT";

export interface ErpInvoiceListState {
  searchInput: string;
  search: string;
  page: number;
  pageSize: number;

  period: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  seller_name: string;
  buyer_name: string;
  tag_id: string;
  activeTaxTab: string;

  sortBy: string;
  sortOrder: "asc" | "desc";

  filterPanelOpen: boolean;
}

const getInitialActiveTaxTab = (): string => {
  if (typeof window === "undefined") return "all";
  try {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    if (view && ["all", "new", "replacement", "adjustment"].includes(view)) {
      return view;
    }
  } catch (err) {
    void err;
  }
  return "all";
};

const defaultState = (pageSize = 50): ErpInvoiceListState => ({
  searchInput: "",
  search: "",
  page: 1,
  pageSize,
  period: "",
  dateFrom: "",
  dateTo: "",
  status: "",
  seller_name: "",
  buyer_name: "",
  tag_id: "",
  activeTaxTab: getInitialActiveTaxTab(),
  sortBy: "invoiceDate",
  sortOrder: "desc",
  filterPanelOpen: false,
});

export interface ErpInvoiceListStore {
  states: Record<Direction, ErpInvoiceListState>;

  updateState: (dir: Direction, updates: Partial<ErpInvoiceListState>) => void;
  hydrateFromUrl: (
    dir: Direction,
    urlState: Partial<ErpInvoiceListState>,
  ) => void;

  setSearchInput: (dir: Direction, v: string) => void;
  setSearch: (dir: Direction, v: string) => void;
  setPage: (dir: Direction, v: number) => void;
  setPageSize: (dir: Direction, v: number) => void;

  setPeriod: (dir: Direction, v: string) => void;
  setDateFrom: (dir: Direction, v: string) => void;
  setDateTo: (dir: Direction, v: string) => void;
  setStatus: (dir: Direction, v: string) => void;
  setSellerName: (dir: Direction, v: string) => void;
  setBuyerName: (dir: Direction, v: string) => void;
  setTagId: (dir: Direction, v: string) => void;
  setActiveTaxTab: (dir: Direction, tab: string) => void;

  handleSort: (dir: Direction, key: string) => void;
  setFilterPanelOpen: (
    dir: Direction,
    v: boolean | ((prev: boolean) => boolean),
  ) => void;

  resetAllFilters: (dir: Direction) => void;
  migrateState: (fromDir: Direction, toDir: Direction) => void;
}

export const useErpInvoiceListStore = create<ErpInvoiceListStore>(
  (set, get) => ({
    states: {
      IN: defaultState(50),
      OUT: defaultState(50),
      IN_2: defaultState(50),
      OUT_2: defaultState(50),
      CHECKPOINT_IN: defaultState(20),
      CHECKPOINT_OUT: defaultState(20),
    },

    updateState: (dir, updates) => {
      set((state) => ({
        states: {
          ...state.states,
          [dir]: { ...(state.states[dir] || defaultState()), ...updates },
        },
      }));
    },

    hydrateFromUrl: (dir, urlState) => {
      set((state) => ({
        states: {
          ...state.states,
          [dir]: {
            ...(state.states[dir] || defaultState()),
            ...urlState,
          },
        },
      }));
    },

    migrateState: (fromDir, toDir) => {
      set((state) => {
        const fromState = state.states[fromDir];
        if (!fromState) return state;
        return {
          states: {
            ...state.states,
            [toDir]: { ...fromState },
          },
        };
      });
    },

    setSearchInput: (dir, v) => get().updateState(dir, { searchInput: v }),
    setSearch: (dir, v) => get().updateState(dir, { search: v }),
    setPage: (dir, v) => get().updateState(dir, { page: v }),
    setPageSize: (dir, v) => get().updateState(dir, { pageSize: v, page: 1 }),

    setPeriod: (dir, v) => {
      if (v) {
        get().updateState(dir, {
          period: v,
          dateFrom: periodFirstDay(v),
          dateTo: periodLastDay(v),
          page: 1,
        });
      } else {
        get().updateState(dir, {
          period: v,
          dateFrom: "",
          dateTo: "",
          page: 1,
        });
      }
    },
    setDateFrom: (dir, v) =>
      get().updateState(dir, { dateFrom: v, period: "", page: 1 }),
    setDateTo: (dir, v) =>
      get().updateState(dir, { dateTo: v, period: "", page: 1 }),
    setStatus: (dir, v) => get().updateState(dir, { status: v, page: 1 }),
    setSellerName: (dir, v) =>
      get().updateState(dir, { seller_name: v, page: 1 }),
    setBuyerName: (dir, v) =>
      get().updateState(dir, { buyer_name: v, page: 1 }),
    setTagId: (dir, v) => get().updateState(dir, { tag_id: v, page: 1 }),
    setActiveTaxTab: (dir, tab) =>
      get().updateState(dir, { activeTaxTab: tab, page: 1 }),

    handleSort: (dir, key) => {
      const currentState = get().states[dir] || defaultState();
      if (currentState.sortBy === key) {
        if (currentState.sortOrder === "desc") {
          get().updateState(dir, { sortOrder: "asc", page: 1 });
        } else {
          get().updateState(dir, { sortBy: "", sortOrder: "desc", page: 1 });
        }
      } else {
        get().updateState(dir, { sortBy: key, sortOrder: "desc", page: 1 });
      }
    },

    setFilterPanelOpen: (dir, v) => {
      if (typeof v === "function") {
        set((state) => ({
          states: {
            ...state.states,
            [dir]: {
              ...(state.states[dir] || defaultState()),
              filterPanelOpen: v(
                (state.states[dir] || defaultState()).filterPanelOpen,
              ),
            },
          },
        }));
      } else {
        get().updateState(dir, { filterPanelOpen: v });
      }
    },

    resetAllFilters: (dir) => {
      const current = get().states[dir] || defaultState();
      get().updateState(dir, {
        ...defaultState(),
        pageSize: current.pageSize,
        activeTaxTab: current.activeTaxTab || "all",
        sortBy: "invoiceDate",
        sortOrder: "desc",
        filterPanelOpen: current.filterPanelOpen,
      });
    },
  }),
);
