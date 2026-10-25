import {
  useV2TablePreferencesStore,
  V2_PREFERENCES_STORAGE_KEY,
} from "./useV2TablePreferencesStore";
import { V1_PREFERENCES_STORAGE_KEY } from "./v2TablePreferences.migrate";

/** Xoá cấu hình bảng V2 đã lưu local; `includeV1` xoá luôn bản V1 còn sót */
export function clearV2TablePreferencesCache(
  options: { includeV1?: boolean } = {},
): void {
  useV2TablePreferencesStore.setState({ tables: {}, migrationVersion: 0 });
  try {
    localStorage.removeItem(V2_PREFERENCES_STORAGE_KEY);
    if (options.includeV1) localStorage.removeItem(V1_PREFERENCES_STORAGE_KEY);
  } catch {
    // localStorage có thể bị chặn (private mode, cookie bị khoá)
  }
}
