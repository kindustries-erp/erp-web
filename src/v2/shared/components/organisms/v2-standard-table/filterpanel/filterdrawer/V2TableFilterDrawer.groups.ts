import { ColumnValueType } from "@/v2/shared/types/v2-table";
import type { V2FilterColumn } from "../V2StandardTable.filtercards";

export type V2FilterColumnGroupKey = "text" | "select" | "date" | "number";

export interface V2FilterColumnGroup {
  key: V2FilterColumnGroupKey;
  labelKey: string;
  columns: V2FilterColumn[];
}

const GROUP_OF_TYPE: Record<ColumnValueType, V2FilterColumnGroupKey> = {
  [ColumnValueType.TEXT]: "text",
  [ColumnValueType.SELECT]: "select",
  [ColumnValueType.STATUS]: "select",
  [ColumnValueType.DATE]: "date",
  [ColumnValueType.NUMBER]: "number",
};

const GROUP_ORDER: V2FilterColumnGroupKey[] = [
  "text",
  "select",
  "date",
  "number",
];

const GROUP_LABEL_KEY: Record<V2FilterColumnGroupKey, string> = {
  text: "v2.table.filterGroupText",
  select: "v2.table.filterGroupSelect",
  date: "v2.table.filterGroupDate",
  number: "v2.table.filterGroupNumber",
};

/** Nhóm cột theo loại giá trị, giữ thứ tự cột gốc trong mỗi nhóm; bỏ nhóm rỗng */
export function groupFilterColumns(
  columns: V2FilterColumn[],
): V2FilterColumnGroup[] {
  return GROUP_ORDER.map((key) => ({
    key,
    labelKey: GROUP_LABEL_KEY[key],
    columns: columns.filter(
      (column) =>
        column.filter !== undefined &&
        GROUP_OF_TYPE[column.filter.valueType] === key,
    ),
  })).filter((group) => group.columns.length > 0);
}
