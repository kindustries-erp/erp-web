import type { V2TablePreferenceEntry } from "./v2TablePreferences.type";

/** tableId cũ -> tableId theo feature (đồng bộ với migration DB phía API) */
export const V2_TABLE_PREFERENCE_ID_RENAMES: Readonly<Record<string, string>> =
  {
    "erp-garage-procurement-requests-table":
      "procurement-requests-garage-table",
    "erp-garage-procurement-orders-table": "procurement-orders-garage-table",
  };

/**
 * Chuyển cấu hình local từ tableId cũ sang tableId mới. Nếu id mới đã có cấu hình thì giữ
 * bản mới và bỏ bản cũ. Trả về `null` khi không có gì để đổi (idempotent).
 */
export function renameV2TablePreferenceIds(
  tables: Record<string, V2TablePreferenceEntry>,
): Record<string, V2TablePreferenceEntry> | null {
  let next: Record<string, V2TablePreferenceEntry> | null = null;

  for (const [from, to] of Object.entries(V2_TABLE_PREFERENCE_ID_RENAMES)) {
    const source = (next ?? tables)[from];
    if (source === undefined) continue;

    next = { ...(next ?? tables) };
    if (next[to] === undefined) next[to] = source;
    delete next[from];
  }

  return next;
}
