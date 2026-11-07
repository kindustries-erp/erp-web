import type { V2Column } from "../V2StandardTable.type";

export interface V2MobileSlots<T> {
  title?: V2Column<T>;
  subtitle?: V2Column<T>;
  /** Badge đầu tiên, giữ lại để tương thích ngược */
  badge?: V2Column<T>;
  /** Danh sách toàn bộ cột badge cần hiển thị trên header card */
  badges: V2Column<T>[];
  meta: V2Column<T>[];
}

/**
 * Chọn cột nào hiện ở đâu trên card. Cột đặt `mobileSlot` rõ ràng thì giữ nguyên,
 * cột còn lại tự xếp: cột đầu là tiêu đề, cột hai là phụ đề, cột badge (nếu có hoặc cột status),
 * phần còn lại là meta.
 */
export const resolveMobileSlots = <T>(
  columns: V2Column<T>[],
): V2MobileSlots<T> => {
  const visible = columns.filter((column) => column.mobileSlot !== "hidden");
  const title =
    visible.find((column) => column.mobileSlot === "title") ??
    visible.find((column) => !column.mobileSlot);
  const subtitle =
    visible.find((column) => column.mobileSlot === "subtitle") ??
    visible.find((column) => !column.mobileSlot && column !== title);

  const explicitBadges = visible.filter(
    (column) => column.mobileSlot === "badge",
  );
  const fallbackBadge = visible.find(
    (column) =>
      column.key === "status" && column !== title && column !== subtitle,
  );
  const badges =
    explicitBadges.length > 0
      ? explicitBadges
      : fallbackBadge
        ? [fallbackBadge]
        : [];
  const badge = badges[0];

  const meta = visible.filter(
    (column) =>
      column !== title && column !== subtitle && !badges.includes(column),
  );
  return { title, subtitle, badge, badges, meta };
};
