import { create } from "zustand";
import {
  periodFirstDay,
  periodLastDay,
} from "@/modules/finance/utils/financeHelpers";
import type { Direction } from "./useErpInvoiceListStore";

export interface ErpInvoiceItemsState {
  page: number;
  pageSize: number;
  sorts: string[];
  period: string;
  dateFrom: string;
  dateTo: string;
  search: string;
  searchInput: string;
  status: string;
  sellerName: string;
  buyerName: string;
  tagId: string;
  subcategoryFilter: string; // "ALL" | "NORMAL" | "DISCOUNT"
  columnFilters: Record<string, string[]>;
  columnSearch: Record<string, string>;
  filterPanelOpen: boolean;
}

const defaultState = (pageSize = 50): ErpInvoiceItemsState => ({
  page: 1,
  pageSize,
  sorts: [],
  period: "",
  dateFrom: "",
  dateTo: "",
  search: "",
  searchInput: "",
  status: "",
  sellerName: "",
  buyerName: "",
  tagId: "",
  subcategoryFilter: "ALL",
  columnFilters: {},
  columnSearch: {},
  filterPanelOpen: false,
});

export interface ErpInvoiceItemsStore {
  states: Record<Direction, ErpInvoiceItemsState>;

  updateState: (dir: Direction, updates: Partial<ErpInvoiceItemsState>) => void;
  hydrateFromUrl: (
    dir: Direction,
    urlState: Partial<ErpInvoiceItemsState>,
  ) => void;

  setPage: (dir: Direction, v: number) => void;
  setPageSize: (dir: Direction, v: number) => void;
  setSorts: (dir: Direction, sorts: string[]) => void;
  setSort: (
    dir: Direction,
    key: string,
    state: "asc" | "desc" | "none",
  ) => void;

  setPeriod: (dir: Direction, v: string) => void;
  setDateFrom: (dir: Direction, v: string) => void;
  setDateTo: (dir: Direction, v: string) => void;
  setDateRange: (dir: Direction, from: string, to: string) => void;

  setSearchInput: (dir: Direction, v: string) => void;
  setSearch: (dir: Direction, v: string) => void;
  setStatus: (dir: Direction, v: string) => void;
  setSellerName: (dir: Direction, v: string) => void;
  setBuyerName: (dir: Direction, v: string) => void;
  setTagId: (dir: Direction, v: string) => void;
  setSubcategoryFilter: (dir: Direction, v: string) => void;

  setColumnFilter: (dir: Direction, key: string, vals: string[]) => void;
  setColumnSearchValue: (dir: Direction, key: string, val: string) => void;
  setFilterPanelOpen: (
    dir: Direction,
    v: boolean | ((prev: boolean) => boolean),
  ) => void;

  resetAllFilters: (dir: Direction) => void;
}

export const useErpInvoiceItemsStore = create<ErpInvoiceItemsStore>((set) => ({
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

  setPage: (dir, v) => {
    set((state) => ({
      states: {
        ...state.states,
        [dir]: { ...(state.states[dir] || defaultState()), page: v },
      },
    }));
  },

  setPageSize: (dir, v) => {
    set((state) => ({
      states: {
        ...state.states,
        [dir]: {
          ...(state.states[dir] || defaultState()),
          pageSize: v,
          page: 1,
        },
      },
    }));
  },

  setSorts: (dir, sorts) => {
    set((state) => ({
      states: {
        ...state.states,
        [dir]: { ...(state.states[dir] || defaultState()), sorts, page: 1 },
      },
    }));
  },

  setSort: (dir, key, sortState) => {
    set((state) => {
      const cur = state.states[dir] || defaultState();
      let newSorts: string[] = [];
      if (sortState === "asc") newSorts = [key];
      else if (sortState === "desc") newSorts = [`-${key}`];
      return {
        states: {
          ...state.states,
          [dir]: { ...cur, sorts: newSorts, page: 1 },
        },
      };
    });
  },

  setPeriod: (dir, p) => {
    set((state) => {
      const cur = state.states[dir] || defaultState();
      const dateFrom = p ? periodFirstDay(p) : "";
      const dateTo = p ? periodLastDay(p) : "";
      return {
        states: {
          ...state.states,
          [dir]: { ...cur, period: p, dateFrom, dateTo, page: 1 },
        },
      };
    });
  },

  setDateFrom: (dir, v) => {
    set((state) => ({
      states: {
        ...state.states,
        [dir]: {
          ...(state.states[dir] || defaultState()),
          dateFrom: v,
          period: "",
          page: 1,
        },
      },
    }));
  },

  setDateTo: (dir, v) => {
    set((state) => ({
      states: {
        ...state.states,
        [dir]: {
          ...(state.states[dir] || defaultState()),
          dateTo: v,
          period: "",
          page: 1,
        },
      },
    }));
  },

  setDateRange: (dir, from, to) => {
    set((state) => ({
      states: {
        ...state.states,
        [dir]: {
          ...(state.states[dir] || defaultState()),
          dateFrom: from,
          dateTo: to,
          period: "",
          page: 1,
        },
      },
    }));
  },

  setSearchInput: (dir, v) => {
    set((state) => ({
      states: {
        ...state.states,
        [dir]: { ...(state.states[dir] || defaultState()), searchInput: v },
      },
    }));
  },

  setSearch: (dir, v) => {
    set((state) => ({
      states: {
        ...state.states,
        [dir]: {
          ...(state.states[dir] || defaultState()),
          search: v,
          searchInput: v,
          page: 1,
        },
      },
    }));
  },

  setStatus: (dir, v) => {
    set((state) => ({
      states: {
        ...state.states,
        [dir]: { ...(state.states[dir] || defaultState()), status: v, page: 1 },
      },
    }));
  },

  setSellerName: (dir, v) => {
    set((state) => ({
      states: {
        ...state.states,
        [dir]: {
          ...(state.states[dir] || defaultState()),
          sellerName: v,
          page: 1,
        },
      },
    }));
  },

  setBuyerName: (dir, v) => {
    set((state) => ({
      states: {
        ...state.states,
        [dir]: {
          ...(state.states[dir] || defaultState()),
          buyerName: v,
          page: 1,
        },
      },
    }));
  },

  setTagId: (dir, v) => {
    set((state) => ({
      states: {
        ...state.states,
        [dir]: {
          ...(state.states[dir] || defaultState()),
          tagId: v,
          page: 1,
        },
      },
    }));
  },

  setSubcategoryFilter: (dir, v) => {
    set((state) => ({
      states: {
        ...state.states,
        [dir]: {
          ...(state.states[dir] || defaultState()),
          subcategoryFilter: v,
          page: 1,
        },
      },
    }));
  },

  setColumnFilter: (dir, key, vals) => {
    set((state) => {
      const cur = state.states[dir] || defaultState();
      const nextFilters = { ...cur.columnFilters };
      if (!vals || vals.length === 0) {
        delete nextFilters[key];
      } else {
        nextFilters[key] = vals;
      }
      return {
        states: {
          ...state.states,
          [dir]: { ...cur, columnFilters: nextFilters, page: 1 },
        },
      };
    });
  },

  setColumnSearchValue: (dir, key, val) => {
    set((state) => {
      const cur = state.states[dir] || defaultState();
      const nextSearch = { ...cur.columnSearch };
      if (!val || !val.trim()) {
        delete nextSearch[key];
      } else {
        nextSearch[key] = val;
      }
      return {
        states: {
          ...state.states,
          [dir]: { ...cur, columnSearch: nextSearch, page: 1 },
        },
      };
    });
  },

  setFilterPanelOpen: (dir, v) => {
    set((state) => {
      const cur = state.states[dir] || defaultState();
      const nextVal = typeof v === "function" ? v(cur.filterPanelOpen) : v;
      return {
        states: {
          ...state.states,
          [dir]: { ...cur, filterPanelOpen: nextVal },
        },
      };
    });
  },

  resetAllFilters: (dir) => {
    set((state) => {
      const cur = state.states[dir] || defaultState();
      return {
        states: {
          ...state.states,
          [dir]: {
            ...cur,
            search: "",
            searchInput: "",
            status: "",
            sellerName: "",
            buyerName: "",
            tagId: "",
            period: "",
            dateFrom: "",
            dateTo: "",
            subcategoryFilter: "ALL",
            columnFilters: {},
            columnSearch: {},
            page: 1,
          },
        },
      };
    });
  },
}));
