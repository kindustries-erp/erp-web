import {
  ColumnValueType,
  V2_ALL_MATCHING_VALUE,
  V2_BLANK_VALUE,
} from "@/v2/shared/types/v2-table";
import type {
  V2OperatorFilter,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import {
  evaluateDateOperator,
  evaluateDateRange,
  evaluateNumber,
  evaluateText,
  toText,
} from "./v2TableEvaluate";

export interface V2Keyword {
  text: string;
  exact: boolean;
}

export interface V2ClientFilterColumn<T> {
  key: string;
  valueType: ColumnValueType;
  getValue: (row: T) => unknown;
}

export type V2ClientFilterQuery = Pick<
  V2TableQuery,
  "columnFilters" | "columnSearch" | "columnOperators" | "dateRanges"
>;

export const parseKeywords = (input: string): V2Keyword[] =>
  input
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const exact =
        part.length >= 2 && part.startsWith('"') && part.endsWith('"');
      return {
        text: (exact ? part.slice(1, -1) : part).toLowerCase(),
        exact,
      };
    })
    .filter((keyword) => keyword.text.length > 0);

export const matchesKeywords = (
  value: unknown,
  keywords: V2Keyword[],
): boolean => {
  if (keywords.length === 0) return true;
  const text = toText(value).toLowerCase();
  return keywords.some((k) =>
    k.exact ? text === k.text : text.includes(k.text),
  );
};

const buildSelectedMatcher = (selected: string[]) => {
  if (selected.length === 0) return null;
  if (selected[0] === V2_ALL_MATCHING_VALUE) {
    const keywords = parseKeywords(selected[1] ?? "");
    return (value: unknown) => matchesKeywords(value, keywords);
  }
  return (value: unknown) => {
    const text = toText(value);
    return text === ""
      ? selected.includes(V2_BLANK_VALUE)
      : selected.includes(text);
  };
};

const buildOperatorMatcher = (
  valueType: ColumnValueType,
  filter: V2OperatorFilter | undefined,
) => {
  if (!filter) return null;
  const evaluate =
    valueType === ColumnValueType.NUMBER
      ? evaluateNumber
      : valueType === ColumnValueType.DATE
        ? evaluateDateOperator
        : evaluateText;
  return (value: unknown) => evaluate(value, filter);
};

const buildColumnPredicate = <T>(
  column: V2ClientFilterColumn<T>,
  query: V2ClientFilterQuery,
): ((row: T) => boolean) | null => {
  const range = query.dateRanges[column.key];
  const keywords = parseKeywords(query.columnSearch[column.key] ?? "");
  const matchers = [
    buildSelectedMatcher(query.columnFilters[column.key] ?? []),
    keywords.length > 0
      ? (value: unknown) => matchesKeywords(value, keywords)
      : null,
    buildOperatorMatcher(column.valueType, query.columnOperators[column.key]),
    range ? (value: unknown) => evaluateDateRange(value, range) : null,
  ].filter(
    (matcher): matcher is (value: unknown) => boolean => matcher !== null,
  );
  if (matchers.length === 0) return null;
  return (row) => {
    const value = column.getValue(row);
    return matchers.every((matches) => matches(value));
  };
};

/** Tìm toàn cục: dòng khớp khi bất kỳ giá trị nào chứa một trong các từ khóa (dấu `;` ngăn cách, "..." là khớp chính xác) */
export const searchClientItems = <T>(
  items: T[],
  getValues: (row: T) => unknown[],
  search: string | undefined,
): T[] => {
  const keywords = parseKeywords(search ?? "");
  if (keywords.length === 0) return items;
  return items.filter((row) =>
    getValues(row).some((value) => matchesKeywords(value, keywords)),
  );
};

export const filterClientItems = <T>(
  items: T[],
  columns: V2ClientFilterColumn<T>[],
  query: V2ClientFilterQuery,
): T[] => {
  const predicates = columns
    .map((column) => buildColumnPredicate(column, query))
    .filter((p): p is (row: T) => boolean => p !== null);
  if (predicates.length === 0) return items;
  return items.filter((row) => predicates.every((matches) => matches(row)));
};
