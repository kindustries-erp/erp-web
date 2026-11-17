/**
 * Cấu hình và router cho các Presentation Decks công khai.
 * Hỗ trợ tiền tố chuẩn `/public/*` (ví dụ `/public/imotorbike`) và tương thích ngược với `/imotorbike`.
 */

export const PUBLIC_DECK_ROUTES: Record<string, string> = {
  "/imotorbike": "imotorbike",
  "/public/imotorbike": "imotorbike",
};

/**
 * Danh sách các deck key được hỗ trợ chính thức.
 */
export const SUPPORTED_DECK_KEYS: readonly string[] = ["imotorbike"];

/**
 * Phân giải pathname thành deckKey tương ứng nếu là route public deck hợp lệ.
 * - Hỗ trợ cả `/imotorbike` và `/public/imotorbike` (và mọi deck trong SUPPORTED_DECK_KEYS qua pattern `/public/:deckKey`).
 * - Xử lý an toàn cả khi có trailing slash.
 */
export function resolvePublicDeckKey(pathname?: string): string | null {
  const rawPath =
    pathname ?? (typeof window !== "undefined" ? window.location.pathname : "");
  if (!rawPath) return null;

  const normalized = rawPath.replace(/\/+$/, "") || "/";

  // 1. Khớp từ bảng route tĩnh
  if (PUBLIC_DECK_ROUTES[normalized]) {
    return PUBLIC_DECK_ROUTES[normalized];
  }

  // 2. Khớp tiền tố chuẩn /public/:deckKey
  if (normalized.startsWith("/public/")) {
    const candidate = normalized.slice("/public/".length);
    if (SUPPORTED_DECK_KEYS.includes(candidate)) {
      return candidate;
    }
  }

  return null;
}
