import { create } from "zustand";

interface AccountingJournalListState {
  page: number;
  pageSize: number;
  search: string;
  searchInput: string;
  statusFilter: string;
  dateFrom: string;
  dateTo: string;

  setPage: (v: number) => void;
  setPageSize: (v: number) => void;
  setSearch: (v: string) => void;
  setSearchInput: (v: string) => void;
  setStatusFilter: (v: string) => void;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
  resetAllFilters: () => void;
}

export const useAccountingJournalListStore = create<AccountingJournalListState>(
  (set) => ({
    page: 1,
    pageSize: 20,
    search: "",
    searchInput: "",
    statusFilter: "",
    dateFrom: "",
    dateTo: "",

    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setSearch: (search) => set({ search, page: 1 }),
    setSearchInput: (searchInput) => set({ searchInput }),
    setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
    setDateFrom: (dateFrom) => set({ dateFrom, page: 1 }),
    setDateTo: (dateTo) => set({ dateTo, page: 1 }),

    resetAllFilters: () =>
      set({
        page: 1,
        search: "",
        searchInput: "",
        statusFilter: "",
        dateFrom: "",
        dateTo: "",
      }),
  }),
);
