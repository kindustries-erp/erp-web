import * as React from "react";
import type { V2FilterGroup, V2FilterGroupItem } from "@/v2/shared/components";
import type { ProcurementListFilter } from "../procurement.types";

/** Khóa "Tất cả" của nhóm lọc: không lọc theo trạng thái, chỉ xem phiếu chưa xóa. */
export const PROCUREMENT_ALL_KEY = "all";
/** Khóa lọc "Đã xóa mềm": API trả các phiếu đã xóa mềm. */
export const PROCUREMENT_DELETED_KEY = "deleted";

/** Đổi khóa nhóm lọc thành bộ lọc gửi lên API. */
export function toProcurementListFilter(key: string): ProcurementListFilter {
  if (key === PROCUREMENT_DELETED_KEY) return { deleted: "only" };
  if (key === PROCUREMENT_ALL_KEY) return {};
  return { status: key };
}

/** Dựng nhóm lọc có sẵn (trạng thái + đã xóa mềm) cho popover chế độ xem. */
export function buildProcurementFilterGroup(args: {
  title: string;
  allLabel: string;
  deletedLabel: string;
  statusItems: { value: string; label: string }[];
  activeKey: string;
  onChange: (key: string) => void;
}): V2FilterGroup {
  const items: V2FilterGroupItem[] = [
    { key: PROCUREMENT_ALL_KEY, label: args.allLabel },
    ...args.statusItems.map((item) => ({ key: item.value, label: item.label })),
    { key: PROCUREMENT_DELETED_KEY, label: args.deletedLabel },
  ];
  return {
    title: args.title,
    items,
    activeKey: args.activeKey,
    onChange: args.onChange,
    allKey: PROCUREMENT_ALL_KEY,
  };
}

/** Trạng thái nhóm lọc của một bảng procurement: khóa đang chọn và số lần đổi để reset bảng. */
export function useProcurementListFilter() {
  const [filterKey, setFilterKey] = React.useState(PROCUREMENT_ALL_KEY);
  const [resetCount, setResetCount] = React.useState(0);

  const changeFilter = React.useCallback((key: string) => {
    setFilterKey(key);
    setResetCount((count) => count + 1);
  }, []);

  const filter = React.useMemo(
    () => toProcurementListFilter(filterKey),
    [filterKey],
  );

  return {
    filterKey,
    filter,
    changeFilter,
    resetCount,
    isDeleted: filter.deleted === "only",
  };
}
