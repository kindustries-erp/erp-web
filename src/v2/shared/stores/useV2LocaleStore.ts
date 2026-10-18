import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { V2_PREFERENCES_PATH } from "@/v2/shared/preferences/v2TablePreferences.sync";

export type V2Locale = "vi" | "en";

export const V2_LOCALE_STORAGE_KEY = "v2_locale";
/** Key localStorage của store V1, chỉ đọc để seed ngôn ngữ lần đầu */
export const V1_APP_STORAGE_KEY = "erp-app";

const isV2Locale = (value: unknown): value is V2Locale =>
  value === "vi" || value === "en";

/** Ngôn ngữ V1 đã chọn; đọc raw JSON để không import code V1 */
export function readV1Locale(): V2Locale | undefined {
  try {
    const raw = localStorage.getItem(V1_APP_STORAGE_KEY);
    const locale = raw
      ? (JSON.parse(raw) as { state?: { locale?: unknown } }).state?.locale
      : undefined;
    return isV2Locale(locale) ? locale : undefined;
  } catch {
    return undefined;
  }
}

export interface V2LocaleState {
  locale: V2Locale;
  /** Đổi ngôn ngữ V2; đã đăng nhập thì lưu lên server như V1 */
  setLocale: (locale: V2Locale) => void;
  /** Áp ngôn ngữ đã lưu trên server khi đăng nhập */
  applyServerLanguage: (language: unknown) => void;
}

export const useV2LocaleStore = create<V2LocaleState>()(
  persist(
    (set) => ({
      locale: readV1Locale() ?? "vi",
      setLocale: (locale) => {
        set({ locale });
        if (useAuthStore.getState().accessToken) {
          void v2HttpClient
            .patch(V2_PREFERENCES_PATH, { language: locale })
            .catch(() => undefined);
        }
      },
      applyServerLanguage: (language) => {
        if (isV2Locale(language)) set({ locale: language });
      },
    }),
    { name: V2_LOCALE_STORAGE_KEY },
  ),
);
