import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import {
  useV2LocaleStore,
  V2_USER_PREFERENCES_PATH,
} from "@/v2/shared/stores/useV2LocaleStore";
import { useV2TablePreferencesStore } from "./useV2TablePreferencesStore";
import type { V2TablePreferenceEntry } from "./v2TablePreferences.type";
import { V2_TABLE_PREFERENCES_PATH } from "./v2TablePreferences.sync";

interface UserPreferencesResponse {
  data?: { language?: unknown };
}

interface TablePreferencesResponse {
  data?: Record<string, V2TablePreferenceEntry>;
}

/** Sau khi đăng nhập: nạp cấu hình từng bảng V2 và ngôn ngữ đã lưu trên server */
export async function loadV2ServerPreferences(): Promise<void> {
  const [tables, user] = await Promise.allSettled([
    v2HttpClient.get<TablePreferencesResponse>(V2_TABLE_PREFERENCES_PATH),
    v2HttpClient.get<UserPreferencesResponse>(V2_USER_PREFERENCES_PATH),
  ]);

  // Mỗi phần lỗi độc lập: không tải được thì giữ cấu hình local, giống V1
  if (tables.status === "fulfilled") {
    useV2TablePreferencesStore
      .getState()
      .applyServerTables(tables.value.data?.data ?? {});
  }
  if (user.status === "fulfilled") {
    useV2LocaleStore
      .getState()
      .applyServerLanguage(user.value.data?.data?.language);
  }
}
