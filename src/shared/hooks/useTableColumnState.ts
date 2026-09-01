import { create } from "zustand";
import { useMemo } from "react";
import { clearAllDropdownSearchStates } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { decodeStateParam } from "@/shared/utils/pageUrl";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";

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

export function isTableMatchingCurrentUrl(
  tableId: string,
  pathname: string,
  search: string,
): boolean {
  // If table is a modal, drawer, checkpoint, or preview table, it should NOT inherit page URL filters
  if (
    tableId.includes("checkpoint") ||
    tableId.includes("drawer") ||
    tableId.includes("modal") ||
    tableId.includes("selection") ||
    tableId.includes("preview") ||
    tableId.includes("detail")
  ) {
    return false;
  }

  const params = new URLSearchParams(search);
  const tab = params.get(ErpUrlQueryParam.TAB);

  // 1. ERP Invoices
  if (
    tableId.startsWith("erp-invoices-table-") ||
    tableId.startsWith("erp-invoice-items-table-")
  ) {
    if (tab === "in-lines") {
      return (
        tableId === "erp-invoice-items-table-IN" ||
        tableId === "erp-invoice-items-table-IN_2"
      );
    }
    if (tab === "out-lines") {
      return (
        tableId === "erp-invoice-items-table-OUT" ||
        tableId === "erp-invoice-items-table-OUT_2"
      );
    }
    if (tab === "out") {
      return (
        tableId === "erp-invoices-table-OUT" ||
        tableId === "erp-invoices-table-OUT_2"
      );
    }
    // Default tab is 'in' (or ?tab=in)
    return (
      tableId === "erp-invoices-table-IN" ||
      tableId === "erp-invoices-table-IN_2"
    );
  }

  // 2. VinFast Parts
  if (tableId.startsWith("vinfast-parts-stock-")) {
    if (tab === "xemay") return tableId === "vinfast-parts-stock-xemay";
    if (tab === "oto") return tableId === "vinfast-parts-stock-oto";
    return false;
  }

  // 3. Tracked Goods / Inventory Serials
  if (tableId.startsWith("inventory-serials-table-")) {
    if (tab === "lot") return tableId === "inventory-serials-table-lot";
    if (tab === "custom") return tableId === "inventory-serials-table-custom";
    if (tab === "vehicle") return tableId === "inventory-serials-table-vehicle";
    // Default tab is 'parts'
    return tableId === "inventory-serials-table-parts";
  }

  // 4. Bank Statements
  if (tableId.startsWith("bank-transactions-table-")) {
    if (tab === "bidv") return tableId === "bank-transactions-table-bidv";
    if (tab === "cashbook")
      return tableId === "bank-transactions-table-cashbook";
    // Default tab is 'tcb'
    return tableId === "bank-transactions-table-tcb";
  }

  // Other single tables (e.g. inventory-stock-table, garage-cases-table, etc.)
  return true;
}

export function getInitialTableState(tableId: string): TableColumnState {
  if (initialTableStates[tableId]) {
    return initialTableStates[tableId];
  }
  if (typeof window === "undefined") {
    initialTableStates[tableId] = { ...defaultTableState };
    return initialTableStates[tableId];
  }
  try {
    const isMatch = isTableMatchingCurrentUrl(
      tableId,
      window.location.pathname,
      window.location.search,
    );

    if (!isMatch) {
      initialTableStates[tableId] = { ...defaultTableState };
      return initialTableStates[tableId];
    }

    const params = new URLSearchParams(window.location.search);
    const cf = params.get(ErpUrlQueryParam.COLUMN_FILTERS);
    let columnFilters: Record<string, string[]> = {};
    if (cf) {
      const decoded = decodeStateParam<Record<string, string[]>>(cf);
      if (decoded && typeof decoded === "object") {
        columnFilters = decoded;
      }
    }
    const cs = params.get(ErpUrlQueryParam.COLUMN_SEARCH);
    let columnSearch: Record<string, string> = {};
    if (cs) {
      const decoded = decodeStateParam<Record<string, string>>(cs);
      if (decoded && typeof decoded === "object") {
        columnSearch = decoded;
      }
    }
    let sorts: string[] = [];
    const sortsParam = params.get(ErpUrlQueryParam.SORTS);
    if (sortsParam) {
      try {
        const parsed = JSON.parse(sortsParam);
        if (Array.isArray(parsed)) sorts = parsed;
      } catch {
        const decoded = decodeStateParam<string[]>(sortsParam);
        if (Array.isArray(decoded)) sorts = decoded;
        else sorts = [sortsParam];
      }
    }
    initialTableStates[tableId] = {
      sorts,
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
  const tableState = useTableColumnStore(
    (s) => s.tables[tableId] || getInitialTableState(tableId),
  );

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
      useTableColumnStore.getState().setSort(tableId, field, state),
    toggleSort: (field: string) =>
      useTableColumnStore.getState().toggleSort(tableId, field),
    setColumnSearch: (col: string, val: string) =>
      useTableColumnStore.getState().setColumnSearch(tableId, col, val),
    setColumnFilter: (col: string, vals: string[]) =>
      useTableColumnStore.getState().setColumnFilter(tableId, col, vals),
    setDateRange: (from?: string, to?: string) =>
      useTableColumnStore.getState().setDateRange(tableId, from, to),
    resetFilters: () => useTableColumnStore.getState().resetFilters(tableId),
  };
}
