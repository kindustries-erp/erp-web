import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { V2TablePreferenceEntry } from "./v2TablePreferences.type";

/** Mỗi bảng có một bản ghi riêng trên server: `PATCH …/table-preferences/:tableId` */
export const V2_TABLE_PREFERENCES_PATH = "/api/v1/app/table-preferences";
const SYNC_DEBOUNCE_MS = 500;

let pending: Record<string, V2TablePreferenceEntry> = {};
let timer: ReturnType<typeof setTimeout> | null = null;

export const v2TablePreferencePath = (tableId: string) =>
  `${V2_TABLE_PREFERENCES_PATH}/${encodeURIComponent(tableId)}`;

const flush = () => {
  const batch = pending;
  pending = {};
  timer = null;
  // Đồng bộ nền: lỗi mạng không chặn thao tác của người dùng (giống V1)
  for (const [tableId, entry] of Object.entries(batch)) {
    void v2HttpClient
      .patch(v2TablePreferencePath(tableId), entry)
      .catch(() => undefined);
  }
};

export function scheduleTablePreferenceSync(
  tableId: string,
  entry: V2TablePreferenceEntry,
) {
  pending[tableId] = entry;
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, SYNC_DEBOUNCE_MS);
}
