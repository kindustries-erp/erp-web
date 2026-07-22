import { create } from "zustand";
import { useMemo } from "react";

interface TableColumnState {
  sorts: string[];
  columnSearch: Record<string, string>;
  columnFilters: Record<string, string[]>;
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
  resetFilters: (tableId: string) => void;
}

const defaultTableState: TableColumnState = {
  sorts: [],
  columnSearch: {},
  columnFilters: {},
};

export const useTableColumnStore = create<TableColumnStore>((set, get) => ({
  tables: {},

  initTable: (tableId: string) => {
    if (!get().tables[tableId]) {
      set((state) => ({
        tables: {
          ...state.tables,
          [tableId]: { ...defaultTableState },
        },
      }));
    }
  },

  setSort: (tableId, field, sortState) => {
    set((state) => {
      const table = state.tables[tableId] || { ...defaultTableState };
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
      const table = state.tables[tableId] || { ...defaultTableState };
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
      const table = state.tables[tableId] || { ...defaultTableState };
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
      const table = state.tables[tableId] || { ...defaultTableState };
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

  resetFilters: (tableId) => {
    set((state) => ({
      tables: {
        ...state.tables,
        [tableId]: { ...defaultTableState },
      },
    }));
  },
}));

/**
 * Custom hook to easily consume the table column state per table.
 */
export function useTableColumnState(tableId: string) {
  const store = useTableColumnStore();
  const tableState = store.tables[tableId] || defaultTableState;

  const activeFilterCount = useMemo(() => {
    const activeCols = new Set<string>();
    Object.entries(tableState.columnFilters).forEach(([col, f]) => {
      if (f && f.length > 0) activeCols.add(col);
    });
    Object.entries(tableState.columnSearch).forEach(([col, s]) => {
      if (s) activeCols.add(col);
    });
    return activeCols.size;
  }, [tableState.columnFilters, tableState.columnSearch]);

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
    resetFilters: () => store.resetFilters(tableId),
  };
}
