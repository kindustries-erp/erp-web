import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { V2TablePreferenceEntry } from "./v2TablePreferences.type";

/**
 * Cấu hình V2 đi cùng `tableConfigs` của user preference trên server, nhưng dưới
 * key `v2:<tableId>` để không ghi đè cấu trúc V1 đang dùng key `<tableId>`.
 */
export const V2_PREFERENCE_PREFIX = "v2:";
export const V2_PREFERENCES_PATH = "/api/v1/app/preferences";
const SYNC_DEBOUNCE_MS = 500;

let pending: Record<string, V2TablePreferenceEntry> = {};
let timer: ReturnType<typeof setTimeout> | null = null;

const flush = () => {
  const tableConfigs = pending;
  pending = {};
  timer = null;
  // Đồng bộ nền: lỗi mạng không chặn thao tác của người dùng (giống V1)
  void v2HttpClient
    .patch(V2_PREFERENCES_PATH, { tableConfigs })
    .catch(() => undefined);
};

export function scheduleTablePreferenceSync(
  tableId: string,
  entry: V2TablePreferenceEntry,
) {
  pending[`${V2_PREFERENCE_PREFIX}${tableId}`] = entry;
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, SYNC_DEBOUNCE_MS);
}

/** Lọc `tableConfigs` của server, chỉ giữ các key V2 và bỏ tiền tố */
export function pickV2TableConfigs(
  tableConfigs: Record<string, unknown>,
): Record<string, V2TablePreferenceEntry> {
  return Object.fromEntries(
    Object.entries(tableConfigs)
      .filter(([key]) => key.startsWith(V2_PREFERENCE_PREFIX))
      .map(([key, value]) => [
        key.slice(V2_PREFERENCE_PREFIX.length),
        value as V2TablePreferenceEntry,
      ]),
  );
}
