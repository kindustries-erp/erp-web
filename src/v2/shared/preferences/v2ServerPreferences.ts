import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";
import { useV2TablePreferencesStore } from "./useV2TablePreferencesStore";
import {
  pickV2TableConfigs,
  V2_PREFERENCES_PATH,
} from "./v2TablePreferences.sync";

interface ServerPreferencesResponse {
  data?: { language?: unknown; tableConfigs?: Record<string, unknown> };
}

/** Một lần GET sau khi đăng nhập: nạp cấu hình bảng V2 và ngôn ngữ đã lưu trên server */
export async function loadV2ServerPreferences(): Promise<void> {
  try {
    const { data } =
      await v2HttpClient.get<ServerPreferencesResponse>(V2_PREFERENCES_PATH);
    useV2TablePreferencesStore
      .getState()
      .applyServerTables(pickV2TableConfigs(data?.data?.tableConfigs ?? {}));
    useV2LocaleStore.getState().applyServerLanguage(data?.data?.language);
  } catch {
    // Không tải được thì giữ cấu hình local, giống V1
  }
}
