import type {
  V2FetchOptions,
  V2FilterOption,
} from "@/v2/shared/types/v2-table";
import { extractUniqueOptions, paginateOptions } from "./v2TableClient";
import {
  matchesKeywords,
  parseKeywords,
  type V2ClientFilterColumn,
} from "./v2TableFilter";
import type { V2Column } from "./V2StandardTable.type";

export const getCellValue = <T>(
  row: T,
  key: string,
  accessor?: (row: T) => unknown,
): unknown => {
  if (accessor) return accessor(row);
  return key
    .split(".")
    .reduce<unknown>(
      (value, part) =>
        value !== null && typeof value === "object"
          ? (value as Record<string, unknown>)[part]
          : undefined,
      row,
    );
};

export const toClientColumns = <T>(
  columns: V2Column<T>[],
): V2ClientFilterColumn<T>[] =>
  columns.flatMap((column) =>
    column.filter
      ? [
          {
            key: column.key,
            valueType: column.filter.valueType,
            getValue: (row: T) =>
              getCellValue(row, column.key, column.accessor),
          },
        ]
      : [],
  );

/** Giá trị của mọi cột trên một dòng, dùng cho tìm kiếm toàn cục (chế độ client) */
export const toSearchValues =
  <T>(columns: V2Column<T>[]) =>
  (row: T): unknown[] =>
    columns.map((column) => getCellValue(row, column.key, column.accessor));

export const createStaticFetchOptions =
  (options: V2FilterOption[]): V2FetchOptions =>
  async ({ search, pageParam }) => {
    const keywords = parseKeywords(search);
    const matched = options.filter(
      (option) =>
        matchesKeywords(option.label, keywords) ||
        matchesKeywords(option.value, keywords),
    );
    return paginateOptions(matched, pageParam);
  };

export const createClientFetchOptions =
  <T>(items: T[], column: V2Column<T>): V2FetchOptions =>
  async ({ search, pageParam }) =>
    paginateOptions(
      extractUniqueOptions(
        items,
        (row) => getCellValue(row, column.key, column.accessor),
        { search, formatOptionLabel: column.filter?.formatOptionLabel },
      ),
      pageParam,
    );

export const resolveColumnFetchOptions = <T>(
  column: V2Column<T>,
  items: T[],
  mode: "server" | "client",
  serverFetch?: V2FetchOptions,
): V2FetchOptions | undefined => {
  if (column.filter?.filterOptions) {
    return createStaticFetchOptions(column.filter.filterOptions);
  }
  return mode === "client"
    ? createClientFetchOptions(items, column)
    : serverFetch;
};
