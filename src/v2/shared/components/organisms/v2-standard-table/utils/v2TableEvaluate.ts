import {
  DateFilterOperator,
  NumberFilterOperator,
  TextFilterOperator,
} from "@/v2/shared/types/v2-table";
import type { V2DateRange, V2OperatorFilter } from "@/v2/shared/types/v2-table";

export const toText = (value: unknown): string =>
  value === null || value === undefined ? "" : String(value);

export const evaluateText = (
  value: unknown,
  filter: V2OperatorFilter,
): boolean => {
  const text = toText(value).toLowerCase();
  if (filter.operator === TextFilterOperator.IS_EMPTY)
    return text.trim() === "";
  if (filter.operator === TextFilterOperator.IS_NOT_EMPTY) {
    return text.trim() !== "";
  }
  const needle = filter.value.trim().toLowerCase();
  if (needle === "") return true;
  switch (filter.operator) {
    case TextFilterOperator.CONTAINS:
      return text.includes(needle);
    case TextFilterOperator.NOT_CONTAINS:
      return !text.includes(needle);
    case TextFilterOperator.STARTS_WITH:
      return text.startsWith(needle);
    case TextFilterOperator.ENDS_WITH:
      return text.endsWith(needle);
    case TextFilterOperator.EQUALS:
      return text === needle;
    case TextFilterOperator.NOT_EQUALS:
      return text !== needle;
    default:
      return true;
  }
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = toText(value).trim();
  if (text === "") return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
};

export const evaluateNumber = (
  value: unknown,
  filter: V2OperatorFilter,
): boolean => {
  const target = toNumber(filter.value);
  if (target === null) return true;
  const n = toNumber(value);
  if (n === null) return false;
  switch (filter.operator) {
    case NumberFilterOperator.EQUALS:
      return n === target;
    case NumberFilterOperator.NOT_EQUALS:
      return n !== target;
    case NumberFilterOperator.GREATER_THAN:
      return n > target;
    case NumberFilterOperator.GREATER_THAN_OR_EQUAL:
      return n >= target;
    case NumberFilterOperator.LESS_THAN:
      return n < target;
    case NumberFilterOperator.LESS_THAN_OR_EQUAL:
      return n <= target;
    case NumberFilterOperator.BETWEEN: {
      const upper = toNumber(filter.valueTo);
      return n >= target && (upper === null || n <= upper);
    }
    default:
      return true;
  }
};

const toDay = (value: unknown): string => toText(value).slice(0, 10);

export const evaluateDateRange = (
  value: unknown,
  range: V2DateRange,
): boolean => {
  if (!range.from && !range.to) return true;
  const day = toDay(value);
  if (day === "") return false;
  if (range.from && day < range.from) return false;
  if (range.to && day > range.to) return false;
  return true;
};

export const evaluateDateOperator = (
  value: unknown,
  filter: V2OperatorFilter,
): boolean => {
  const target = toDay(filter.value);
  if (target === "") return true;
  const day = toDay(value);
  if (day === "") return false;
  switch (filter.operator) {
    case DateFilterOperator.EQUALS:
      return day === target;
    case DateFilterOperator.BEFORE:
      return day < target;
    case DateFilterOperator.AFTER:
      return day > target;
    case DateFilterOperator.BETWEEN:
      return evaluateDateRange(value, {
        from: target,
        to: toDay(filter.valueTo),
      });
    default:
      return true;
  }
};
