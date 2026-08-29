import { create } from "zustand";
import { useMemo } from "react";
import { clearAllDropdownSearchStates } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { decodeStateParam } from "@/shared/utils/pageUrl";

interface TableColumnState {
  sorts: string[];
  columnSearch: Record<string, string>;
  columnFilters: Record<string, string[]>;
  dateFrom?: string;
  dateTo?: string;
}

interface TableColumnStore {
  tables: Record<string, TableColumnState>;

  initTable: (tableId: string) => void;
  setSort: (
    tableId: string,
    field: string,
    state: "asc" | "desc" | "none",
  ) => void;
  toggleSort: (tableId: string, field: string) => void;
  setColumnSearch: (tableId: string, col: string, val: string) => void;
  setColumnFilter: (tableId: string, col: string, vals: string[]) => void;
  setDateRange: (tableId: string, from?: string, to?: string) => void;
  resetFilters: (tableId: string) => void;
  migrateTableState: (fromTableId: string, toTableId: string) => void;
}

const defaultTableState: TableColumnState = {
  sorts: [],
  columnSearch: {},
  columnFilters: {},
  dateFrom: undefined,
  dateTo: undefined,
};

const initialTableStates: Record<string, TableColumnState> = {};

export function getInitialTableState(tableId: string): TableColumnState {
  if (initialTableStates[tableId]) {
    return initialTableStates[tableId];
  }
  if (typeof window === "undefined") {
    initialTableStates[tableId] = { ...defaultTableState };
    return initialTableStates[tableId];
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const cf = params.get("cf");
    let columnFilters: Record<string, string[]> = {};
    if (cf) {
      const decoded = decodeStateParam<Record<string, string[]>>(cf);
      if (decoded && typeof decoded === "object") {
        columnFilters = decoded;
      }
    }
    const cs = params.get("cs");
    let columnSearch: Record<string, string> = {};
    if (cs) {
      const decoded = decodeStateParam<Record<string, string>>(cs);
      if (decoded && typeof decoded === "object") {
        columnSearch = decoded;
      }
    }
    initialTableStates[tableId] = {
      sorts: [],
      columnSearch,
      columnFilters,
    };
    return initialTableStates[tableId];
  } catch {
    initialTableStates[tableId] = { ...defaultTableState };
    return initialTableStates[tableId];
  }
}

export const useTableColumnStore = create<TableColumnStore>((set, get) => ({
  tables: {},

  initTable: (tableId: string) => {
    if (!get().tables[tableId]) {
      set((state) => ({
        tables: {
          ...state.tables,
          [tableId]: getInitialTableState(tableId),
        },
      }));
    }
  },

  setSort: (tableId, field, sortState) => {
    set((state) => {
      const table = state.tables[tableId] || getInitialTableState(tableId);
      const nextSorts = table.sorts.filter(
        (s) => s !== field && s !== `-${field}`,
      );
      if (sortState === "asc") nextSorts.push(field);
      else if (sortState === "desc") nextSorts.push(`-${field}`);

      return {
        tables: {
          ...state.tables,
          [tableId]: { ...table, sorts: nextSorts },
        },
      };
    });
  },

  toggleSort: (tableId, field) => {
    set((state) => {
      const table = state.tables[tableId] || getInitialTableState(tableId);
      const nextSorts = [...table.sorts];
      const ascIdx = nextSorts.indexOf(field);
      const descIdx = nextSorts.indexOf(`-${field}`);

      if (ascIdx >= 0) {
        nextSorts[ascIdx] = `-${field}`;
      } else if (descIdx >= 0) {
        nextSorts.splice(descIdx, 1);
      } else {
        nextSorts.push(field);
      }

      return {
        tables: {
          ...state.tables,
          [tableId]: { ...table, sorts: nextSorts },
        },
      };
    });
  },

  setColumnSearch: (tableId, col, val) => {
    set((state) => {
      const table = state.tables[tableId] || getInitialTableState(tableId);
      return {
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            columnSearch: { ...table.columnSearch, [col]: val },
          },
        },
      };
    });
  },

  setColumnFilter: (tableId, col, vals) => {
    set((state) => {
      const table = state.tables[tableId] || getInitialTableState(tableId);
      return {
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            columnFilters: { ...table.columnFilters, [col]: vals },
          },
        },
      };
    });
  },

  setDateRange: (tableId, from, to) => {
    set((state) => {
      const table = state.tables[tableId] || getInitialTableState(tableId);
      return {
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            dateFrom: from,
            dateTo: to,
          },
        },
      };
    });
  },

  resetFilters: (tableId) => {
    clearAllDropdownSearchStates();
    set((state) => ({
      tables: {
        ...state.tables,
        [tableId]: { ...defaultTableState },
      },
    }));
  },

  migrateTableState: (fromTableId, toTableId) => {
    set((state) => {
      const fromTable = state.tables[fromTableId];
      if (!fromTable) return state;
      return {
        tables: {
          ...state.tables,
          [toTableId]: { ...fromTable },
        },
      };
    });
  },
}));

/**
 * Custom hook to easily consume the table column state per table.
 */
export function useTableColumnState(tableId: string) {
  const store = useTableColumnStore();
  const tableState = store.tables[tableId] || getInitialTableState(tableId);

  const activeFilterCount = useMemo(() => {
    const activeCols = new Set<string>();
    Object.entries(tableState.columnFilters).forEach(([col, f]) => {
      if (f && f.length > 0) activeCols.add(col);
    });
    Object.entries(tableState.columnSearch).forEach(([col, s]) => {
      if (s) activeCols.add(col);
    });
    if (tableState.dateFrom || tableState.dateTo) {
      activeCols.add("dateRange");
    }
    return activeCols.size;
  }, [
    tableState.columnFilters,
    tableState.columnSearch,
    tableState.dateFrom,
    tableState.dateTo,
  ]);

  return {
    ...tableState,
    activeFilterCount,
    setSort: (field: string, state: "asc" | "desc" | "none") =>
      store.setSort(tableId, field, state),
    toggleSort: (field: string) => store.toggleSort(tableId, field),
    setColumnSearch: (col: string, val: string) =>
      store.setColumnSearch(tableId, col, val),
    setColumnFilter: (col: string, vals: string[]) =>
      store.setColumnFilter(tableId, col, vals),
    setDateRange: (from?: string, to?: string) =>
      store.setDateRange(tableId, from, to),
    resetFilters: () => store.resetFilters(tableId),
  };
}
