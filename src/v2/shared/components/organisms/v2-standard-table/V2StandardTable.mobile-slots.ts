import type { V2Column } from "./V2StandardTable.type";

export interface V2MobileSlots<T> {
  title?: V2Column<T>;
  subtitle?: V2Column<T>;
  meta: V2Column<T>[];
}

/**
 * Chọn cột nào hiện ở đâu trên card. Cột đặt `mobileSlot` rõ ràng thì giữ nguyên,
 * cột còn lại tự xếp: cột đầu là tiêu đề, cột hai là phụ đề, phần còn lại là meta.
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
  const meta = visible.filter(
    (column) => column !== title && column !== subtitle,
  );
  return { title, subtitle, meta };
};
