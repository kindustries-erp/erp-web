import type { NotificationTarget } from "@/core/api/notifications";

/** Đích thông báo của đề nghị mua hàng garage (khớp backend `PROCUREMENT_REQUEST_GARAGE`). */
export const PROCUREMENT_REQUEST_GARAGE_TARGET = "PROCUREMENT_REQUEST_GARAGE";

const GARAGE_PROCUREMENT_PATH = "garage-procurement";

/** Giữ tiền tố `/v2` nếu người dùng đang ở shell V2. */
const pathFor = (currentPathname: string, path: string): string =>
  currentPathname.startsWith("/v2/") ? `/v2/${path}` : `/${path}`;

/**
 * Đường dẫn mở đúng chứng từ khi bấm thông báo. Trả null nếu đích không được hỗ trợ
 * (khi đó bấm thông báo chỉ đánh dấu đã đọc).
 * - `APPROVE`: mở modal duyệt của phiếu (deep link `open` + `action`).
 * - `VIEW`: mở drawer xem phiếu.
 */
export function resolveNotificationHref(
  target: NotificationTarget | null | undefined,
  currentPathname: string,
): string | null {
  if (!target || !target.id) return null;
  if (target.module !== PROCUREMENT_REQUEST_GARAGE_TARGET) return null;

  const params = new URLSearchParams({ tab: "requests", open: target.id });
  if (target.action === "APPROVE") params.set("action", "APPROVE");
  return `${pathFor(currentPathname, GARAGE_PROCUREMENT_PATH)}?${params.toString()}`;
}
