import { useMemo } from "react";
import { useRowContextMenu } from "@/v2/shared/components/molecules/v2-table-row-actions";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";

/** Menu chuột phải: dòng đang mở và danh sách action của dòng đó */
export function useV2RowMenu<T>(
  rows: T[],
  getRowKey: (row: T) => string,
  rowActions?: (row: T) => V2RowActionGroup[],
) {
  const menu = useRowContextMenu();
  const menuRowKey = menu.state?.rowKey ?? null;
  const menuGroups = useMemo(() => {
    const target = rows.find((row) => getRowKey(row) === menuRowKey);
    return target && rowActions ? rowActions(target) : [];
  }, [rows, getRowKey, menuRowKey, rowActions]);

  return { menu, menuRowKey, menuGroups };
}
