import { create } from "zustand";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------
interface OperationalListState {
  searchInput: string;
  search: string;
  page: number;
  pageSize: number;

  // Filters
  branchFilter: string;
  paymentStatusFilter: string;
  statusFilter: string;
  recurringFilter: string;
  period: string;
  dateFrom: string;
  dateTo: string;
  itemTypeFilter: string;
  supplierFilter: string;
  itemFilter: string;
  purchaseSort: string;
  inventorySort: string;

  // UI state
  filterPanelOpen: boolean;
  expandedRowIds: Record<string, boolean>;
  expandedStockItemIds: Record<string, boolean>;
  supplierSearch: string;
  itemSearch: string;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------
interface OperationalListActions {
  setSearchInput: (v: string) => void;
  setSearch: (v: string) => void;
  setPage: (v: number) => void;
  setPageSize: (v: number) => void;

  setBranchFilter: (v: string) => void;
  setPaymentStatusFilter: (v: string) => void;
  setStatusFilter: (v: string) => void;
  setRecurringFilter: (v: string) => void;
  setPeriod: (v: string) => void;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
  setItemTypeFilter: (v: string) => void;
  setSupplierFilter: (v: string) => void;
  setItemFilter: (v: string) => void;

  togglePurchaseSort: (field: string) => void;
  setPurchaseSort: (v: string) => void;

  toggleInventorySort: (field: string) => void;
  setInventorySort: (v: string) => void;

  setFilterPanelOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  toggleExpandRow: (key: string) => void;
  toggleExpandStockItem: (id: string) => void;

  setSupplierSearch: (v: string) => void;
  setItemSearch: (v: string) => void;

  resetAllFilters: () => void;
}

// ---------------------------------------------------------------------------
// Default state
// ---------------------------------------------------------------------------
const defaultState = (): OperationalListState => ({
  searchInput: "",
  search: "",
  page: 1,
  pageSize: 20,
  branchFilter: "",
  paymentStatusFilter: "",
  statusFilter: "",
  recurringFilter: "",
  period: "",
  dateFrom: "",
  dateTo: "",
  itemTypeFilter: "",
  supplierFilter: "",
  itemFilter: "",
  purchaseSort: "",
  inventorySort: "",
  filterPanelOpen: false,
  expandedRowIds: {},
  expandedStockItemIds: {},
  supplierSearch: "",
  itemSearch: "",
});

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useOperationalListStore = create<
  OperationalListState & OperationalListActions
>((set, get) => ({
  ...defaultState(),

  setSearchInput: (v) => set({ searchInput: v }),
  setSearch: (v) => set({ search: v }),
  setPage: (v) => set({ page: v }),
  setPageSize: (v) => set({ pageSize: v }),

  setBranchFilter: (v) => set({ branchFilter: v }),
  setPaymentStatusFilter: (v) => set({ paymentStatusFilter: v }),
  setStatusFilter: (v) => set({ statusFilter: v }),
  setRecurringFilter: (v) => set({ recurringFilter: v }),
  setPeriod: (v) => set({ period: v }),
  setDateFrom: (v) => set({ dateFrom: v }),
  setDateTo: (v) => set({ dateTo: v }),
  setItemTypeFilter: (v) => set({ itemTypeFilter: v }),
  setSupplierFilter: (v) => set({ supplierFilter: v }),
  setItemFilter: (v) => set({ itemFilter: v }),

  togglePurchaseSort: (field) => {
    const prev = get().purchaseSort;
    let next: string;
    if (prev === field) next = `-${field}`;
    else if (prev === `-${field}`) next = "";
    else next = field;
    set({ purchaseSort: next, page: 1 });
  },

  setPurchaseSort: (v) => set({ purchaseSort: v }),

  toggleInventorySort: (field) => {
    const prev = get().inventorySort;
    let next: string;
    if (prev === field) next = `-${field}`;
    else if (prev === `-${field}`) next = "";
    else next = field;
    set({ inventorySort: next, page: 1 });
  },

  setInventorySort: (v) => set({ inventorySort: v }),

  setFilterPanelOpen: (v) => {
    if (typeof v === "function") {
      set((state) => ({ filterPanelOpen: v(state.filterPanelOpen) }));
    } else {
      set({ filterPanelOpen: v });
    }
  },

  toggleExpandRow: (key) => {
    set((state) => ({
      expandedRowIds: {
        ...state.expandedRowIds,
        [key]: !state.expandedRowIds[key],
      },
    }));
  },

  toggleExpandStockItem: (id) => {
    set((state) => ({
      expandedStockItemIds: {
        ...state.expandedStockItemIds,
        [id]: !state.expandedStockItemIds[id],
      },
    }));
  },

  setSupplierSearch: (v) => set({ supplierSearch: v }),
  setItemSearch: (v) => set({ itemSearch: v }),

  resetAllFilters: () => {
    set({
      searchInput: "",
      search: "",
      branchFilter: "",
      statusFilter: "",
      paymentStatusFilter: "",
      recurringFilter: "",
      itemTypeFilter: "",
      supplierFilter: "",
      purchaseSort: "",
      inventorySort: "",
      period: "",
      dateFrom: "",
      dateTo: "",
      page: 1,
    });
  },
}));
