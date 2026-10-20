import {
  ColumnValueType,
  TableSortState,
  V2_BLANK_VALUE,
} from "@/v2/shared/types/v2-table";
import type {
  V2FetchOptionsResult,
  V2FilterOption,
  V2TableSort,
} from "@/v2/shared/types/v2-table";
import { toText } from "./v2TableEvaluate";
import {
  matchesKeywords,
  parseKeywords,
  type V2ClientFilterColumn,
} from "./v2TableFilter";

const compareValues = (
  a: unknown,
  b: unknown,
  valueType: ColumnValueType,
): number => {
  const textA = toText(a);
  const textB = toText(b);
  if (valueType === ColumnValueType.NUMBER) {
    const numA = Number(textA);
    const numB = Number(textB);
    if (Number.isFinite(numA) && Number.isFinite(numB)) return numA - numB;
  }
  if (valueType === ColumnValueType.DATE) {
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  }
  return textA.localeCompare(textB, "vi", {
    numeric: true,
    sensitivity: "base",
  });
};

export const sortClientItems = <T>(
  items: T[],
  columns: V2ClientFilterColumn<T>[],
  sorts: V2TableSort[],
): T[] => {
  const active = sorts.flatMap((sort) => {
    const column = columns.find((c) => c.key === sort.columnKey);
    return column ? [{ sort, column }] : [];
  });
  if (active.length === 0) return items;
  return [...items].sort((rowA, rowB) => {
    for (const { sort, column } of active) {
      const a = column.getValue(rowA);
      const b = column.getValue(rowB);
      const blankA = toText(a) === "";
      const blankB = toText(b) === "";
      if (blankA || blankB) {
        if (blankA && blankB) continue;
        return blankA ? 1 : -1;
      }
      const result = compareValues(a, b, column.valueType);
      if (result !== 0) {
        return sort.direction === TableSortState.DESC ? -result : result;
      }
    }
    return 0;
  });
};

export const paginateClientItems = <T>(
  items: T[],
  page: number,
  pageSize: number,
): T[] => items.slice((page - 1) * pageSize, page * pageSize);

export interface V2ExtractOptionsConfig {
  search?: string;
  showBlankOption?: boolean;
  formatOptionLabel?: (value: string) => string;
}

export const extractUniqueOptions = <T>(
  items: T[],
  getValue: (row: T) => unknown,
  config: V2ExtractOptionsConfig = {},
): V2FilterOption[] => {
  const keywords = parseKeywords(config.search ?? "");
  const format = config.formatOptionLabel ?? ((value: string) => value);
  const unique = new Set<string>();
  let hasBlank = false;
  for (const row of items) {
    const text = toText(getValue(row));
    if (text === "") hasBlank = true;
    else unique.add(text);
  }
  const options = [...unique]
    .sort((a, b) => a.localeCompare(b, "vi", { numeric: true }))
    .map((value) => ({ value, label: format(value) }))
    .filter(
      (o) =>
        matchesKeywords(o.label, keywords) ||
        matchesKeywords(o.value, keywords),
    );
  const showBlank = config.showBlankOption && hasBlank && keywords.length === 0;
  return showBlank
    ? [{ value: V2_BLANK_VALUE, label: V2_BLANK_VALUE }, ...options]
    : options;
};

export const paginateOptions = (
  options: V2FilterOption[],
  pageParam: number,
  pageSize = 20,
): V2FetchOptionsResult => {
  const start = (pageParam - 1) * pageSize;
  return {
    items: options.slice(start, start + pageSize),
    total: options.length,
    next: start + pageSize < options.length ? pageParam + 1 : null,
  };
};
