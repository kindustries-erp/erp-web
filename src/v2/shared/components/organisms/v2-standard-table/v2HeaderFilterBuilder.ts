import { ColumnValueType } from "@/v2/shared/types/v2-table";
import type { V2FilterOption } from "@/v2/shared/types/v2-table";
import {
  formatAmountOptionLabel,
  formatNumberOptionLabel,
} from "@/v2/shared/utils/v2TableFormat";
import type { V2Column } from "./V2StandardTable.type";

export interface V2HeaderFilterOptions {
  showBlankOption?: boolean;
  formatOptionLabel?: (value: string) => string;
}

export type V2HeaderFilterResult = Pick<V2Column<unknown>, "label" | "filter">;

const build = (
  label: string,
  valueType: ColumnValueType,
  options: V2HeaderFilterOptions & { filterOptions?: V2FilterOption[] } = {},
): V2HeaderFilterResult => ({ label, filter: { valueType, ...options } });

/**
 * Khai báo cột có header filter: `{ key: "code", ...headerFilter("Mã"), cell }`.
 * Bảng tự render popover lọc/sắp xếp từ spec này.
 */
export const headerFilter = Object.assign(
  (label: string, options?: V2HeaderFilterOptions) =>
    build(label, ColumnValueType.TEXT, options),
  {
    date: (label: string) => build(label, ColumnValueType.DATE),
    amount: (label: string, options?: V2HeaderFilterOptions) =>
      build(label, ColumnValueType.NUMBER, {
        formatOptionLabel: formatAmountOptionLabel,
        ...options,
      }),
    qty: (label: string, options?: V2HeaderFilterOptions) =>
      build(label, ColumnValueType.NUMBER, {
        formatOptionLabel: formatNumberOptionLabel,
        ...options,
      }),
    select: (label: string, filterOptions: V2FilterOption[]) =>
      build(label, ColumnValueType.SELECT, { filterOptions }),
  },
);
