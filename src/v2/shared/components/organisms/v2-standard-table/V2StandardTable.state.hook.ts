import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TableSortState } from "@/v2/shared/types/v2-table";
import type {
  V2DateRange,
  V2OperatorFilter,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import { normalizePageSize } from "@/v2/shared/utils/v2TableFormat";
import {
  countActiveFilters,
  createInitialQuery,
  withValue,
} from "./v2TableQuery";

export interface UseV2TableStateOptions {
  initialQuery?: Partial<V2TableQuery>;
  onQueryChange?: (query: V2TableQuery) => void;
}

export interface V2TableState {
  query: V2TableQuery;
  activeFilterCount: number;
  getSort: (columnKey: string) => TableSortState;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (columnKey: string, direction: TableSortState) => void;
  setColumnFilter: (columnKey: string, values: string[]) => void;
  setColumnSearch: (columnKey: string, text: string) => void;
  setColumnOperator: (
    columnKey: string,
    filter: V2OperatorFilter | null,
  ) => void;
  setDateRange: (columnKey: string, range: V2DateRange | null) => void;
  setSearch: (text: string) => void;
  clearColumn: (columnKey: string) => void;
  resetAll: () => void;
}

export const useV2TableState = ({
  initialQuery,
  onQueryChange,
}: UseV2TableStateOptions = {}): V2TableState => {
  const [query, setQuery] = useState(() => createInitialQuery(initialQuery));
  const lastEmitted = useRef(query);
  const onChangeRef = useRef(onQueryChange);
  onChangeRef.current = onQueryChange;

  useEffect(() => {
    if (lastEmitted.current === query) return;
    lastEmitted.current = query;
    onChangeRef.current?.(query);
  }, [query]);

  const patch = useCallback(
    (update: (current: V2TableQuery) => Partial<V2TableQuery>) =>
      setQuery((current) => ({ ...current, page: 1, ...update(current) })),
    [],
  );

  const setPage = useCallback(
    (page: number) =>
      setQuery((current) => ({ ...current, page: Math.max(1, page) })),
    [],
  );

  const setPageSize = useCallback(
    (pageSize: number) =>
      patch(() => ({ pageSize: normalizePageSize(pageSize) })),
    [patch],
  );

  const setSort = useCallback(
    (columnKey: string, direction: TableSortState) =>
      patch(() => ({
        sorts:
          direction === TableSortState.NONE ? [] : [{ columnKey, direction }],
      })),
    [patch],
  );

  const setColumnFilter = useCallback(
    (columnKey: string, values: string[]) =>
      patch((c) => ({
        columnFilters: withValue(
          c.columnFilters,
          columnKey,
          values.length > 0 ? values : null,
        ),
      })),
    [patch],
  );

  const setColumnSearch = useCallback(
    (columnKey: string, text: string) =>
      patch((c) => ({
        columnSearch: withValue(
          c.columnSearch,
          columnKey,
          text.trim() === "" ? null : text,
        ),
      })),
    [patch],
  );

  const setColumnOperator = useCallback(
    (columnKey: string, filter: V2OperatorFilter | null) =>
      patch((c) => ({
        columnOperators: withValue(c.columnOperators, columnKey, filter),
      })),
    [patch],
  );

  const setDateRange = useCallback(
    (columnKey: string, range: V2DateRange | null) =>
      patch((c) => ({
        dateRanges: withValue(
          c.dateRanges,
          columnKey,
          range && (range.from || range.to) ? range : null,
        ),
      })),
    [patch],
  );

  const setSearch = useCallback(
    (text: string) =>
      patch(() => ({ search: text.trim() === "" ? undefined : text })),
    [patch],
  );

  const clearColumn = useCallback(
    (columnKey: string) =>
      patch((c) => ({
        columnFilters: withValue(c.columnFilters, columnKey, null),
        columnSearch: withValue(c.columnSearch, columnKey, null),
        columnOperators: withValue(c.columnOperators, columnKey, null),
        dateRanges: withValue(c.dateRanges, columnKey, null),
      })),
    [patch],
  );

  const resetAll = useCallback(
    () =>
      patch(() => ({
        columnFilters: {},
        columnSearch: {},
        columnOperators: {},
        dateRanges: {},
        search: undefined,
      })),
    [patch],
  );

  const getSort = useCallback(
    (columnKey: string) =>
      query.sorts.find((s) => s.columnKey === columnKey)?.direction ??
      TableSortState.NONE,
    [query.sorts],
  );

  const activeFilterCount = useMemo(() => countActiveFilters(query), [query]);

  return {
    query,
    activeFilterCount,
    getSort,
    setPage,
    setPageSize,
    setSort,
    setColumnFilter,
    setColumnSearch,
    setColumnOperator,
    setDateRange,
    setSearch,
    clearColumn,
    resetAll,
  };
};
