import {
  ColumnValueType,
  DateFilterOperator,
  NumberFilterOperator,
  TextFilterOperator,
} from "@/v2/shared/types/v2-table";
import type {
  V2FilterOperator,
  V2OperatorFilter,
} from "@/v2/shared/types/v2-table";

export type V2OperatorGroup = "text" | "number" | "date";

export const getOperatorGroup = (
  valueType: ColumnValueType,
): V2OperatorGroup | null => {
  if (valueType === ColumnValueType.TEXT) return "text";
  if (valueType === ColumnValueType.NUMBER) return "number";
  if (valueType === ColumnValueType.DATE) return "date";
  return null;
};

export const getOperators = (group: V2OperatorGroup): V2FilterOperator[] => {
  if (group === "text") return Object.values(TextFilterOperator);
  if (group === "number") return Object.values(NumberFilterOperator);
  return Object.values(DateFilterOperator);
};

export const getDefaultOperator = (group: V2OperatorGroup): V2FilterOperator =>
  getOperators(group)[0];

export const operatorNeedsValue = (operator: V2FilterOperator): boolean =>
  operator !== TextFilterOperator.IS_EMPTY &&
  operator !== TextFilterOperator.IS_NOT_EMPTY;

export const operatorNeedsRange = (operator: V2FilterOperator): boolean =>
  operator === NumberFilterOperator.BETWEEN ||
  operator === DateFilterOperator.BETWEEN;

export const buildOperatorFilter = (
  operator: V2FilterOperator,
  value: string,
  valueTo: string,
): V2OperatorFilter | null => {
  if (!operatorNeedsValue(operator)) return { operator, value: "" };
  if (value.trim() === "") return null;
  return operatorNeedsRange(operator) && valueTo.trim() !== ""
    ? { operator, value, valueTo }
    : { operator, value };
};
