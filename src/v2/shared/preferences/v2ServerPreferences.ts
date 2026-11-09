import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import {
  useV2LocaleStore,
  V2_USER_PREFERENCES_PATH,
} from "@/v2/shared/stores/useV2LocaleStore";
import { useV2TablePreferencesStore } from "./useV2TablePreferencesStore";
import type {
  V2TablePreferenceEntry,
  V2TablePreferenceListResponse,
} from "./v2TablePreferences.type";
import {
  V2_TABLE_PREFERENCES_PATH,
  V2_TABLE_PREFERENCES_V2_PREFIXES,
  v2TablePreferenceListPath,
} from "./v2TablePreferences.sync";

interface UserPreferencesResponse {
  data?: { language?: unknown };
}

interface TablePreferencesResponse {
  data?: Record<string, V2TablePreferenceEntry>;
}

/** Gộp danh sách v2 thành map `tableId -> entry` */
export function toTableMap(
  response: V2TablePreferenceListResponse,
): Record<string, V2TablePreferenceEntry> {
  return Object.fromEntries(
    response.items.map((item) => [
      item.tableId,
      { columns: item.columns, views: item.views },
    ]),
  );
}

/**
 * Sau khi đăng nhập: nạp cấu hình bảng (v1 cho mọi bảng, v2 cho họ đã chuyển) và ngôn ngữ.
 * Mỗi request lỗi độc lập. Với id thuộc họ v2, bản v2 ghi đè bản v1 khi cả hai có.
 */
export async function loadV2ServerPreferences(): Promise<void> {
  const v2Requests = V2_TABLE_PREFERENCES_V2_PREFIXES.map((prefix) =>
    v2HttpClient.get<V2TablePreferenceListResponse>(
      v2TablePreferenceListPath(prefix),
    ),
  );
  const [v1Tables, user, ...v2Tables] = await Promise.allSettled([
    v2HttpClient.get<TablePreferencesResponse>(V2_TABLE_PREFERENCES_PATH),
    v2HttpClient.get<UserPreferencesResponse>(V2_USER_PREFERENCES_PATH),
    ...v2Requests,
  ]);

  // Mỗi phần lỗi độc lập: không tải được thì giữ cấu hình local, giống V1
  const merged: Record<string, V2TablePreferenceEntry> = {};
  if (v1Tables.status === "fulfilled") {
    Object.assign(merged, v1Tables.value.data?.data ?? {});
  }
  for (const result of v2Tables) {
    if (result.status === "fulfilled") {
      Object.assign(merged, toTableMap(result.value.data));
    }
  }
  if (
    v1Tables.status === "fulfilled" ||
    v2Tables.some((r) => r.status === "fulfilled")
  ) {
    useV2TablePreferencesStore.getState().applyServerTables(merged);
  }

  if (user.status === "fulfilled") {
    useV2LocaleStore
      .getState()
      .applyServerLanguage(user.value.data?.data?.language);
  }
}
