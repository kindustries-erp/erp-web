import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2ColumnPreferencesApi } from "./V2StandardTable.preferences.hook";
import type { V2Column } from "./V2StandardTable.type";

export const V2_SELECTION_COLUMN_ID = "__selection";
export const V2_INDEX_COLUMN_ID = "__index";
export const V2_FIXED_COLUMN_SIZE = 40;
const DEFAULT_COLUMN_SIZE = 150;
const MIN_COLUMN_SIZE = 60;
const MAX_COLUMN_SIZE = 800;

interface UseV2TableColumnsParams<T> {
  columns: V2Column<T>[];
  prefs: V2ColumnPreferencesApi;
  enableRowSelection: boolean;
  /** Số dòng đứng trước trang hiện tại, dùng để STT bắt đầu từ 1 trên mọi trang */
  startIndex: number;
}

export function useV2TableColumns<T>({
  columns,
  prefs,
  enableRowSelection,
  startIndex,
}: UseV2TableColumnsParams<T>) {
  const { t } = useV2Translation();

  const columnDefs = useMemo<ColumnDef<T>[]>(() => {
    const defs: ColumnDef<T>[] = [];

    if (enableRowSelection) {
      defs.push({
        id: V2_SELECTION_COLUMN_ID,
        size: V2_FIXED_COLUMN_SIZE,
        enableResizing: false,
        header: ({ table }) => (
          <Checkbox
            aria-label={t("v2.table.selectAll", "Chọn tất cả")}
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(Boolean(value))
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={t("v2.table.selectRow", "Chọn dòng")}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          />
        ),
      });
    }

    defs.push({
      id: V2_INDEX_COLUMN_ID,
      size: V2_FIXED_COLUMN_SIZE,
      enableResizing: false,
      header: () => (
        <span className="block w-full text-center">
          {t("v2.table.indexHeader", "#")}
        </span>
      ),
      cell: ({ row }) => (
        <span className="block w-full text-center tabular-nums">
          {startIndex + row.index + 1}
        </span>
      ),
    });

    columns.forEach((column) =>
      defs.push({
        id: column.key,
        size: column.size ?? DEFAULT_COLUMN_SIZE,
        minSize: MIN_COLUMN_SIZE,
        maxSize: MAX_COLUMN_SIZE,
        enableResizing: column.enableResizing ?? true,
        header: column.label,
        cell: ({ row }) =>
          column.cell(row.original, startIndex + row.index + 1),
      }),
    );

    return defs;
  }, [columns, enableRowSelection, startIndex, t]);

  const columnOrder = useMemo(
    () => [
      ...(enableRowSelection ? [V2_SELECTION_COLUMN_ID] : []),
      V2_INDEX_COLUMN_ID,
      ...prefs.orderedKeys,
    ],
    [enableRowSelection, prefs.orderedKeys],
  );

  const columnVisibility = useMemo(
    () =>
      Object.fromEntries(
        columns.map((column) => [
          column.key,
          column.enableHiding === false || prefs.isVisible(column.key),
        ]),
      ),
    [columns, prefs],
  );

  return { columnDefs, columnOrder, columnVisibility };
}
