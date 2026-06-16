import { create } from "zustand";

interface AccountingConfigListState {
  page: number;
  pageSize: number;
  search: string;
  searchInput: string;

  setPage: (v: number) => void;
  setPageSize: (v: number) => void;
  setSearch: (v: string) => void;
  setSearchInput: (v: string) => void;
  resetAllFilters: () => void;
}

export const useAccountingConfigListStore = create<AccountingConfigListState>(
  (set) => ({
    page: 1,
    pageSize: 20,
    search: "",
    searchInput: "",

    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setSearch: (search) => set({ search, page: 1 }),
    setSearchInput: (searchInput) => set({ searchInput }),

    resetAllFilters: () =>
      set({
        page: 1,
        search: "",
        searchInput: "",
      }),
  }),
);
