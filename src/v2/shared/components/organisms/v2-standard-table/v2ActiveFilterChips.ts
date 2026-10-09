import { getOperatorGroup } from "@/v2/shared/components/molecules/v2-column-header-filter";
import {
  V2_ALL_MATCHING_VALUE,
  type ColumnValueType,
  type V2TableQuery,
} from "@/v2/shared/types/v2-table";
import { formatCompositeFilterValue } from "@/v2/shared/utils/v2TableFormat";
import type { V2Column } from "./V2StandardTable.type";

export interface V2ActiveFilterChip {
  id: string;
  columnKey: string;
  label: string;
  summary: string;
  valueType: ColumnValueType;
}

type Translate = (key: string, options?: Record<string, unknown>) => string;

const formatDate = (iso?: string): string => {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : (iso ?? "…");
};

const summarizeValues = (values: string[], t: Translate): string => {
  if (values[0] === V2_ALL_MATCHING_VALUE) return `"${values[1] ?? ""}"`;
  if (values.length === 1) {
    return formatCompositeFilterValue(values[0], t("v2.table.blank"));
  }
  return t("v2.table.valuesCount", { count: values.length });
};

/** Mỗi cột đang lọc là một chip; gỡ chip = `state.clearColumn(columnKey)` */
export function buildActiveFilterChips<T>(
  query: V2TableQuery,
  columns: V2Column<T>[],
  t: Translate,
): V2ActiveFilterChip[] {
  return columns.flatMap((column) => {
    const valueType = column.filter?.valueType;
    if (!valueType) return [];
    const { key } = column;
    const parts: string[] = [];

    const values = query.columnFilters[key] ?? [];
    if (values.length > 0) parts.push(summarizeValues(values, t));

    const search = (query.columnSearch[key] ?? "").trim();
    if (search) parts.push(`"${search}"`);

    const op = query.columnOperators[key];
    if (op) {
      const name = t(
        `v2.table.operators.${getOperatorGroup(valueType) ?? "text"}.${op.operator}`,
      );
      const range = op.valueTo ? `${op.value} – ${op.valueTo}` : op.value;
      parts.push(`${name} ${range}`.trim());
    }

    const range = query.dateRanges[key];
    if (range && (range.from || range.to)) {
      parts.push(`${formatDate(range.from)} – ${formatDate(range.to)}`);
    }

    return parts.length === 0
      ? []
      : [
          {
            id: key,
            columnKey: key,
            label: column.label,
            summary: parts.join(" · "),
            valueType,
          },
        ];
  });
}
