import type { V2RowAction, V2RowActionGroup } from "@/v2/shared/types/v2-table";

const MENU_GAP_PX = 8;

/**
 * Hai nút nhanh là mục đầu của hai nhóm đầu (TRA CỨU → Xem chi tiết,
 * THAO TÁC → Chỉnh sửa). Chỉ có một nhóm thì lấy hai mục đầu của nhóm đó.
 */
export const getQuickActions = (
  groups: V2RowActionGroup[],
  max = 2,
): V2RowAction[] => {
  const filled = groups.filter((group) => group.items.length > 0);
  return filled.length >= 2
    ? filled.slice(0, max).map((group) => group.items[0])
    : filled.flatMap((group) => group.items).slice(0, max);
};

export const hasRowActions = (groups: V2RowActionGroup[]): boolean =>
  groups.some((group) => group.items.length > 0);

interface ClampInput {
  x: number;
  y: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
  gap?: number;
}

export const clampMenuPosition = ({
  x,
  y,
  width,
  height,
  viewportWidth,
  viewportHeight,
  gap = MENU_GAP_PX,
}: ClampInput): { left: number; top: number } => ({
  left: Math.max(gap, Math.min(x, viewportWidth - width - gap)),
  top: Math.max(gap, Math.min(y, viewportHeight - height - gap)),
});
