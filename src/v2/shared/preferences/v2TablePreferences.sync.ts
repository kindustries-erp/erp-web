import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { V2TablePreferenceEntry } from "./v2TablePreferences.type";

/** V1: `PATCH …/table-preferences/:tableId` cho mọi bảng chưa chuyển sang V2 */
export const V2_TABLE_PREFERENCES_PATH = "/api/v1/app/table-preferences";
/** V2 (`/erp-api-structure`): module `table-preferences` của API v2 */
export const V2_TABLE_PREFERENCES_V2_PATH = "/api/v2/table-preferences";
/**
 * Tableid có tiền tố này đi qua API v2. Đổi danh sách để chuyển thêm họ bảng sang v2;
 * bỏ tiền tố để đưa họ đó về v1 (rollback FE).
 */
export const V2_TABLE_PREFERENCES_V2_PREFIXES: readonly string[] = [
  "procurement-",
  "inventory-movements-",
];
const SYNC_DEBOUNCE_MS = 500;

let pending: Record<string, V2TablePreferenceEntry> = {};
let timer: ReturnType<typeof setTimeout> | null = null;

/** tableId thuộc họ đi qua API v2 */
export const isV2TablePreferenceId = (tableId: string) =>
  V2_TABLE_PREFERENCES_V2_PREFIXES.some((prefix) => tableId.startsWith(prefix));

export const v2TablePreferencePath = (tableId: string) =>
  isV2TablePreferenceId(tableId)
    ? `${V2_TABLE_PREFERENCES_V2_PATH}/${encodeURIComponent(tableId)}`
    : `${V2_TABLE_PREFERENCES_PATH}/${encodeURIComponent(tableId)}`;

/** URL GET danh sách v2 theo một tiền tố */
export const v2TablePreferenceListPath = (prefix: string) =>
  `${V2_TABLE_PREFERENCES_V2_PATH}?tableIdPrefix=${encodeURIComponent(prefix)}`;

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
