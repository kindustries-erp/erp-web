import type { ReactNode } from "react";

export enum TableSortState {
  ASC = "asc",
  DESC = "desc",
  NONE = "none",
}

export enum TableColumnAlign {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
}

export enum ColumnValueType {
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
  STATUS = "status",
  SELECT = "select",
}

export enum TextFilterOperator {
  CONTAINS = "contains",
  NOT_CONTAINS = "not_contains",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  IS_EMPTY = "is_empty",
  IS_NOT_EMPTY = "is_not_empty",
}

export enum NumberFilterOperator {
  EQUALS = "eq",
  NOT_EQUALS = "neq",
  GREATER_THAN = "gt",
  GREATER_THAN_OR_EQUAL = "gte",
  LESS_THAN = "lt",
  LESS_THAN_OR_EQUAL = "lte",
  BETWEEN = "between",
}

export enum DateFilterOperator {
  BETWEEN = "between",
  EQUALS = "eq",
  BEFORE = "before",
  AFTER = "after",
}

export const V2_BLANK_VALUE = "__BLANK__";
export const V2_ALL_MATCHING_VALUE = "__ALL_MATCHING__";
export const V2_COMPOSITE_SEPARATOR = ":::";
export const V2_PAGE_SIZE_OPTIONS = [20, 50, 100, 200] as const;

export interface V2FilterOption {
  label: string;
  value: string;
}

export interface V2FetchOptionsParams {
  columnKey: string;
  search: string;
  pageParam: number;
  filtersStr?: string;
}

export interface V2FetchOptionsResult {
  items: V2FilterOption[];
  total: number;
  next: number | null;
}

export type V2FetchOptions = (
  params: V2FetchOptionsParams,
) => Promise<V2FetchOptionsResult>;

export type V2FilterOperator =
  | TextFilterOperator
  | NumberFilterOperator
  | DateFilterOperator;

export interface V2OperatorFilter {
  operator: V2FilterOperator;
  value: string;
  valueTo?: string;
}

export interface V2DateRange {
  from?: string;
  to?: string;
}

export interface V2TableSort {
  columnKey: string;
  direction: TableSortState.ASC | TableSortState.DESC;
}

export interface V2TableQuery {
  page: number;
  pageSize: number;
  sorts: V2TableSort[];
  columnFilters: Record<string, string[]>;
  columnSearch: Record<string, string>;
  columnOperators: Record<string, V2OperatorFilter>;
  dateRanges: Record<string, V2DateRange>;
}

export interface V2RowAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}

export interface V2RowActionGroup {
  groupLabel?: string;
  items: V2RowAction[];
}
