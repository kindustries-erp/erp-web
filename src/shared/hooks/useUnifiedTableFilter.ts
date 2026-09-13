import { useState, useMemo, useCallback } from "react";
import {
  TableSortState,
  ColumnValueType,
  TextFilterOperator,
  NumberFilterOperator,
  FilterChipCategory,
  type DataTableColumn,
} from "@/shared/components/DataTable/types";
import {
  extractColumnFilterDescriptors,
  type ColumnFilterDescriptor,
  type TableListHookLike,
} from "@/shared/components/DataTable/createColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import type {
  FilterPanelConfig,
  FilterPanelReturn,
} from "@/shared/hooks/useFilterPanel";

export interface ActiveFilterChipItem {
  id: string;
  columnKey: string;
  category: FilterChipCategory;
  label: string;
  valueDisplay: string;
}

export interface UseUnifiedTableFilterOptions<T = any> {
  columns?: DataTableColumn<T>[];
  tableId?: string;
  listHook?: TableListHookLike;
  filterConfig?: FilterPanelConfig;
  filter?: FilterPanelReturn;
  onFilterChange?: () => void;
}

export interface UnifiedTableFilterReturn {
  // Active Filter Summary
  activeFilterCount: number;
  hasActiveFilters: boolean;
  activeChips: ActiveFilterChipItem[];
  removeChip: (chipId: string) => void;
  resetAll: () => void;

  // Column Descriptors
  columnDescriptors: ColumnFilterDescriptor[];

  // Column States & Setters
  columnFilters: Record<string, string[]>;
  setColumnFilter: (key: string, values: string[]) => void;
  columnSearch: Record<string, string>;
  setColumnSearch: (key: string, val: string) => void;
  columnOperators: Record<string, TextFilterOperator | NumberFilterOperator>;
  setColumnOperator: (
    key: string,
    op: TextFilterOperator | NumberFilterOperator,
  ) => void;
  sorts: string[];
  setSort: (
    key: string,
    state: TableSortState | "asc" | "desc" | "none",
  ) => void;
  dateFrom?: string;
  dateTo?: string;
  setDateRange: (from?: string, to?: string) => void;

  // Panel Control
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;

  // Connected Legacy Filter (if any)
  legacyFilter?: FilterPanelReturn;
  legacyConfig?: FilterPanelConfig;
}

/**
 * Format operator label to friendly Vietnamese text
 */
export function getOperatorLabel(
  op: TextFilterOperator | NumberFilterOperator | string,
): string {
  switch (op) {
    case TextFilterOperator.CONTAINS:
      return "Chứa";
    case TextFilterOperator.NOT_CONTAINS:
      return "Không chứa";
    case TextFilterOperator.STARTS_WITH:
      return "Bắt đầu bằng";
    case TextFilterOperator.ENDS_WITH:
      return "Kết thúc bằng";
    case TextFilterOperator.EQUALS:
    case NumberFilterOperator.EQUALS:
      return "=";
    case TextFilterOperator.NOT_EQUALS:
    case NumberFilterOperator.NOT_EQUALS:
      return "≠";
    case TextFilterOperator.IS_EMPTY:
      return "Trống";
    case TextFilterOperator.IS_NOT_EMPTY:
      return "Không trống";
    case NumberFilterOperator.GREATER_THAN:
      return ">";
    case NumberFilterOperator.GREATER_THAN_OR_EQUAL:
      return "≥";
    case NumberFilterOperator.LESS_THAN:
      return "<";
    case NumberFilterOperator.LESS_THAN_OR_EQUAL:
      return "≤";
    case NumberFilterOperator.BETWEEN:
      return "Khoảng";
    default:
      return String(op);
  }
}

export function useUnifiedTableFilter<T = any>(
  options: UseUnifiedTableFilterOptions<T>,
): UnifiedTableFilterReturn {
  const {
    columns = [],
    tableId,
    listHook,
    filterConfig,
    filter: legacyFilter,
    onFilterChange,
  } = options;

  // Local fallback tableState if tableId is provided without listHook
  const storeTableState = useTableColumnState(tableId || "");

  // Panel Open State (prefer legacyFilter if exists, else internal state)
  const [internalPanelOpen, setInternalPanelOpen] = useState(false);

  const panelOpen = legacyFilter ? legacyFilter.panelOpen : internalPanelOpen;
  const openPanel = useCallback(() => {
    if (legacyFilter) legacyFilter.openPanel();
    else setInternalPanelOpen(true);
  }, [legacyFilter]);

  const closePanel = useCallback(() => {
    if (legacyFilter) legacyFilter.closePanel();
    else setInternalPanelOpen(false);
  }, [legacyFilter]);

  const togglePanel = useCallback(() => {
    if (legacyFilter) legacyFilter.togglePanel();
    else setInternalPanelOpen((v) => !v);
  }, [legacyFilter]);

  // Column Operators State
  const [columnOperators, setColumnOperators] = useState<
    Record<string, TextFilterOperator | NumberFilterOperator>
  >({});

  const setColumnOperator = useCallback(
    (key: string, op: TextFilterOperator | NumberFilterOperator) => {
      setColumnOperators((prev) => ({ ...prev, [key]: op }));
      onFilterChange?.();
    },
    [onFilterChange],
  );

  // Extract Column Filter Descriptors
  const columnDescriptors = useMemo(() => {
    return extractColumnFilterDescriptors(columns);
  }, [columns]);

  // Map descriptor by key for quick lookup
  const descriptorMap = useMemo(() => {
    const map = new Map<string, ColumnFilterDescriptor>();
    columnDescriptors.forEach((d) => map.set(d.key, d));
    return map;
  }, [columnDescriptors]);

  // Unified Getters & Setters
  const listHookFilters = listHook?.columnFilters;
  const columnFilters = useMemo(() => {
    if (listHookFilters && Object.keys(listHookFilters).length > 0) {
      return listHookFilters;
    }
    const aggregated: Record<string, string[]> = {};
    columnDescriptors.forEach((desc) => {
      if (desc.selectedFilters && desc.selectedFilters.length > 0) {
        aggregated[desc.key] = desc.selectedFilters;
      }
    });
    if (Object.keys(aggregated).length > 0) {
      return aggregated;
    }
    if (tableId) return storeTableState.columnFilters;
    return {};
  }, [
    listHookFilters,
    columnDescriptors,
    tableId,
    storeTableState.columnFilters,
  ]);

  const listHookSearch = listHook?.columnSearch;
  const columnSearch = useMemo(() => {
    if (listHookSearch && Object.keys(listHookSearch).length > 0) {
      return listHookSearch;
    }
    const aggregated: Record<string, string> = {};
    columnDescriptors.forEach((desc) => {
      if (desc.searchValue) {
        aggregated[desc.key] = desc.searchValue;
      }
    });
    if (Object.keys(aggregated).length > 0) {
      return aggregated;
    }
    if (tableId) return storeTableState.columnSearch;
    return {};
  }, [
    listHookSearch,
    columnDescriptors,
    tableId,
    storeTableState.columnSearch,
  ]);

  const listHookSorts = listHook?.sorts;
  const sorts = useMemo(() => {
    if (listHookSorts && listHookSorts.length > 0) {
      return listHookSorts;
    }
    const aggregated: string[] = [];
    columnDescriptors.forEach((desc) => {
      if (String(desc.sortState) === "asc") {
        aggregated.push(desc.key);
      } else if (String(desc.sortState) === "desc") {
        aggregated.push(`-${desc.key}`);
      }
    });
    if (aggregated.length > 0) {
      return aggregated;
    }
    if (tableId) return storeTableState.sorts;
    return [];
  }, [listHookSorts, columnDescriptors, tableId, storeTableState.sorts]);

  const listHookDateFrom = listHook?.dateFrom;
  const legacyFilterDateFrom = legacyFilter?.state?.dateFrom;
  const dateFrom = useMemo(() => {
    if (listHookDateFrom !== undefined) return listHookDateFrom;
    if (legacyFilterDateFrom !== undefined) return legacyFilterDateFrom;
    if (tableId) return storeTableState.dateFrom;
    return undefined;
  }, [
    listHookDateFrom,
    legacyFilterDateFrom,
    tableId,
    storeTableState.dateFrom,
  ]);

  const listHookDateTo = listHook?.dateTo;
  const legacyFilterDateTo = legacyFilter?.state?.dateTo;
  const dateTo = useMemo(() => {
    if (listHookDateTo !== undefined) return listHookDateTo;
    if (legacyFilterDateTo !== undefined) return legacyFilterDateTo;
    if (tableId) return storeTableState.dateTo;
    return undefined;
  }, [listHookDateTo, legacyFilterDateTo, tableId, storeTableState.dateTo]);

  const setColumnFilter = useCallback(
    (key: string, values: string[]) => {
      const desc = descriptorMap.get(key);
      if (desc?.onFilterChange) {
        desc.onFilterChange(values);
      }
      if (listHook?.setColumnFilter) {
        listHook.setColumnFilter(key, values);
      }
      if (tableId) {
        storeTableState.setColumnFilter(key, values);
      }
      onFilterChange?.();
    },
    [descriptorMap, listHook, tableId, storeTableState, onFilterChange],
  );

  const setColumnSearch = useCallback(
    (key: string, val: string) => {
      const desc = descriptorMap.get(key);
      if (desc?.onSearchChange) {
        desc.onSearchChange(val);
      }
      if (listHook?.setColumnSearch) {
        listHook.setColumnSearch(key, val);
      }
      if (tableId) {
        storeTableState.setColumnSearch(key, val);
      }
      onFilterChange?.();
    },
    [descriptorMap, listHook, tableId, storeTableState, onFilterChange],
  );

  const setSort = useCallback(
    (key: string, state: TableSortState | "asc" | "desc" | "none") => {
      const desc = descriptorMap.get(key);
      if (desc?.onSortChange) {
        desc.onSortChange(state);
      }
      if (listHook?.setSort) {
        listHook.setSort(key, state as any);
      }
      if (tableId) {
        storeTableState.setSort(key, state as any);
      }
      onFilterChange?.();
    },
    [descriptorMap, listHook, tableId, storeTableState, onFilterChange],
  );

  const setDateRange = useCallback(
    (from?: string, to?: string) => {
      columnDescriptors.forEach((d) => {
        if (d.type === ColumnValueType.DATE && d.onDateRangeChange) {
          d.onDateRangeChange(from, to);
        }
      });
      if (listHook?.setDateRange) {
        listHook.setDateRange(from, to);
      } else if (legacyFilter?.setDateRange) {
        legacyFilter.setDateRange(from || "", to || "");
      } else if (legacyFilter?.setDateFrom && legacyFilter?.setDateTo) {
        legacyFilter.setDateFrom(from || "");
        legacyFilter.setDateTo(to || "");
      }
      if (tableId) {
        storeTableState.setDateRange(from, to);
      }
      onFilterChange?.();
    },
    [
      columnDescriptors,
      listHook,
      legacyFilter,
      tableId,
      storeTableState,
      onFilterChange,
    ],
  );

  // Compute Active Filter Chips
  const activeChips = useMemo<ActiveFilterChipItem[]>(() => {
    const chips: ActiveFilterChipItem[] = [];

    // 1. Column Search Chips
    Object.entries(columnSearch).forEach(([key, searchVal]) => {
      if (searchVal && searchVal.trim().length > 0) {
        const desc = descriptorMap.get(key);
        const colTitle = desc?.titleText || key;
        const op = columnOperators[key];
        const isNum = desc?.type === ColumnValueType.NUMBER;

        const display = op
          ? `${getOperatorLabel(op)} "${searchVal}"`
          : `"${searchVal}"`;

        chips.push({
          id: `search-${key}`,
          columnKey: key,
          category: isNum
            ? FilterChipCategory.NUMERIC
            : FilterChipCategory.TEXT,
          label: colTitle,
          valueDisplay: display,
        });
      }
    });

    // 2. Column Multi-select Chips
    Object.entries(columnFilters).forEach(([key, vals]) => {
      if (vals && vals.length > 0) {
        const desc = descriptorMap.get(key);
        const colTitle = desc?.titleText || key;

        let valDisplay: string;
        if (vals[0] === "__ALL_MATCHING__") {
          valDisplay = "(Tất cả khớp tìm kiếm)";
        } else {
          const formattedVals = vals.map((v) => {
            if (v === "__BLANK__") return "(Trống)";
            if (desc?.formatOptionLabel) return desc.formatOptionLabel(v);
            return v;
          });

          if (formattedVals.length <= 2) {
            valDisplay = formattedVals.join(", ");
          } else {
            valDisplay = `${formattedVals.slice(0, 2).join(", ")} (+${formattedVals.length - 2})`;
          }
        }

        chips.push({
          id: `filter-${key}`,
          columnKey: key,
          category: FilterChipCategory.MULTI_SELECT,
          label: colTitle,
          valueDisplay: valDisplay,
        });
      }
    });

    // 3. Date Range Chip
    if (dateFrom || dateTo) {
      const fromStr = dateFrom ? dateFrom : "...";
      const toStr = dateTo ? dateTo : "...";
      chips.push({
        id: "date-range",
        columnKey: "dateRange",
        category: FilterChipCategory.DATE,
        label: "Thời gian",
        valueDisplay: `${fromStr} → ${toStr}`,
      });
    }

    // 4. Sort Chips
    if (sorts && sorts.length > 0) {
      sorts.forEach((s) => {
        const isDesc = s.startsWith("-");
        const sortKey = isDesc ? s.slice(1) : s;
        const desc = descriptorMap.get(sortKey);
        const colTitle = desc?.titleText || sortKey;

        chips.push({
          id: `sort-${sortKey}`,
          columnKey: sortKey,
          category: FilterChipCategory.SORT,
          label: colTitle,
          valueDisplay: isDesc ? "Z → A (Giảm dần)" : "A → Z (Tăng dần)",
        });
      });
    }

    // 5. Legacy Filter Chips (Period, Channel, Custom...)
    if (legacyFilter) {
      const s = legacyFilter.state;
      if (s.channel) {
        chips.push({
          id: "legacy-channel",
          columnKey: "channel",
          category: FilterChipCategory.CUSTOM,
          label: filterConfig?.channel?.label || "Kênh",
          valueDisplay: s.channel,
        });
      }
      if (s.status) {
        chips.push({
          id: "legacy-status",
          columnKey: "status",
          category: FilterChipCategory.CUSTOM,
          label: "Trạng thái",
          valueDisplay: s.status,
        });
      }
      if (s.amountMin || s.amountMax) {
        chips.push({
          id: "legacy-amount",
          columnKey: "amountRange",
          category: FilterChipCategory.NUMERIC,
          label: "Số tiền",
          valueDisplay: `${s.amountMin || "0"} → ${s.amountMax || "∞"}`,
        });
      }
      if (s.custom) {
        Object.entries(s.custom).forEach(([cKey, cVal]) => {
          if (cVal) {
            const conf = filterConfig?.custom?.find((c) => c.key === cKey);
            chips.push({
              id: `legacy-custom-${cKey}`,
              columnKey: cKey,
              category: FilterChipCategory.CUSTOM,
              label: conf?.label || cKey,
              valueDisplay: cVal,
            });
          }
        });
      }
    }

    return chips;
  }, [
    columnSearch,
    columnFilters,
    dateFrom,
    dateTo,
    sorts,
    descriptorMap,
    columnOperators,
    legacyFilter,
    filterConfig,
  ]);

  // Remove individual chip
  const removeChip = useCallback(
    (chipId: string) => {
      if (chipId.startsWith("search-")) {
        const colKey = chipId.replace("search-", "");
        setColumnSearch(colKey, "");
      } else if (chipId.startsWith("filter-")) {
        const colKey = chipId.replace("filter-", "");
        setColumnFilter(colKey, []);
      } else if (chipId === "date-range") {
        setDateRange(undefined, undefined);
      } else if (chipId.startsWith("sort-")) {
        const colKey = chipId.replace("sort-", "");
        setSort(colKey, TableSortState.NONE);
      } else if (chipId === "legacy-channel") {
        legacyFilter?.setChannel("");
      } else if (chipId === "legacy-status") {
        legacyFilter?.setStatus("");
      } else if (chipId === "legacy-amount") {
        legacyFilter?.setAmountMinInput("");
        legacyFilter?.setAmountMaxInput("");
      } else if (chipId.startsWith("legacy-custom-")) {
        const cKey = chipId.replace("legacy-custom-", "");
        legacyFilter?.setCustom(cKey, "");
      }
      onFilterChange?.();
    },
    [
      setColumnSearch,
      setColumnFilter,
      setDateRange,
      setSort,
      legacyFilter,
      onFilterChange,
    ],
  );

  // Reset All
  const resetAll = useCallback(() => {
    // Reset column filters & searches
    if (listHook?.clearAllFilters) {
      listHook.clearAllFilters();
    } else if (listHook?.resetFilters) {
      listHook.resetFilters();
    } else if (tableId) {
      storeTableState.resetFilters();
    }

    // Reset operators
    setColumnOperators({});

    // Reset legacy filter
    if (legacyFilter) {
      legacyFilter.resetAll();
    }

    onFilterChange?.();
  }, [listHook, tableId, storeTableState, legacyFilter, onFilterChange]);

  const hasActiveFilters =
    activeChips.length > 0 ||
    Boolean(legacyFilter ? legacyFilter.hasActiveFilter : false);
  const activeFilterCount = Math.max(
    activeChips.length,
    legacyFilter?.activeFilterCount || 0,
  );

  return {
    activeFilterCount,
    hasActiveFilters,
    activeChips,
    removeChip,
    resetAll,
    columnDescriptors,
    columnFilters,
    setColumnFilter,
    columnSearch,
    setColumnSearch,
    columnOperators,
    setColumnOperator,
    sorts,
    setSort,
    dateFrom,
    dateTo,
    setDateRange,
    panelOpen,
    openPanel,
    closePanel,
    togglePanel,
    legacyFilter,
    legacyConfig: filterConfig,
  };
}
