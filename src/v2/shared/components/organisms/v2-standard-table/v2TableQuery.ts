import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import {
  getDefaultPageSize,
  normalizePageSize,
} from "@/v2/shared/utils/v2TableFormat";

export const createInitialQuery = (
  initial: Partial<V2TableQuery> = {},
): V2TableQuery => ({
  page: initial.page ?? 1,
  pageSize: normalizePageSize(initial.pageSize ?? getDefaultPageSize()),
  sorts: initial.sorts ?? [],
  columnFilters: initial.columnFilters ?? {},
  columnSearch: initial.columnSearch ?? {},
  columnOperators: initial.columnOperators ?? {},
  dateRanges: initial.dateRanges ?? {},
  ...(initial.search ? { search: initial.search } : {}),
});

export const countActiveFilters = (query: V2TableQuery): number => {
  const keys = new Set<string>();
  Object.entries(query.columnFilters).forEach(([key, values]) => {
    if (values.length > 0) keys.add(key);
  });
  Object.entries(query.columnSearch).forEach(([key, text]) => {
    if (text.trim() !== "") keys.add(key);
  });
  Object.keys(query.columnOperators).forEach((key) => keys.add(key));
  Object.entries(query.dateRanges).forEach(([key, range]) => {
    if (range.from || range.to) keys.add(key);
  });
  return keys.size;
};

export const withValue = <T>(
  record: Record<string, T>,
  key: string,
  value: T | null,
): Record<string, T> => {
  const next = { ...record };
  delete next[key];
  return value === null ? next : { ...next, [key]: value };
};
