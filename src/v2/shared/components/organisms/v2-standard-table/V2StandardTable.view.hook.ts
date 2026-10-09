import { useCallback, useMemo } from "react";
import type { V2FetchOptions, V2TableQuery } from "@/v2/shared/types/v2-table";
import { paginateClientItems, sortClientItems } from "./v2TableClient";
import {
  resolveColumnFetchOptions,
  toClientColumns,
  toSearchValues,
} from "./v2TableData";
import { filterClientItems, searchClientItems } from "./v2TableFilter";
import { serializeOtherFilters } from "./v2TableSerialize";
import type { V2Column, V2TableMode } from "./V2StandardTable.type";

interface UseV2TableViewParams<T> {
  mode: V2TableMode;
  items: T[];
  total?: number;
  columns: V2Column<T>[];
  query: V2TableQuery;
  serverFetch?: V2FetchOptions;
}

export function useV2TableView<T>({
  mode,
  items,
  total,
  columns,
  query,
  serverFetch,
}: UseV2TableViewParams<T>) {
  const clientColumns = useMemo(() => toClientColumns(columns), [columns]);
  const searchValues = useMemo(() => toSearchValues(columns), [columns]);

  const view = useMemo(() => {
    const startIndex = (query.page - 1) * query.pageSize;
    if (mode === "server") {
      return {
        rows: items,
        allRows: items,
        total: total ?? items.length,
        startIndex,
      };
    }
    const searched = searchClientItems(items, searchValues, query.search);
    const filtered = filterClientItems(searched, clientColumns, query);
    const sorted = sortClientItems(filtered, clientColumns, query.sorts);
    return {
      rows: paginateClientItems(sorted, query.page, query.pageSize),
      allRows: sorted,
      total: sorted.length,
      startIndex,
    };
  }, [mode, items, total, clientColumns, searchValues, query]);

  const fetchOptionsFor = useCallback(
    (column: V2Column<T>) =>
      resolveColumnFetchOptions(column, items, mode, serverFetch),
    [items, mode, serverFetch],
  );

  const filtersStrFor = useCallback(
    (columnKey: string) =>
      mode === "client"
        ? `client:${items.length}`
        : serializeOtherFilters(query, columnKey),
    [mode, items.length, query],
  );

  return { ...view, fetchOptionsFor, filtersStrFor };
}
