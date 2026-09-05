/**
 * System Language Registry — Single Source of Truth for all supported languages
 * across Liouni ERP Web (UI Switcher, i18n, Multilingual Inputs, Custom Fields, etc.)
 */

export interface SystemLanguage {
  /** ISO 639-1 language code (e.g. 'vi', 'en', 'zh', 'ja', 'ko') */
  code: string;
  /** English display name */
  name: string;
  /** Native localized language name */
  nativeName: string;
  /** Emoji Flag */
  flag: string;
  /** Short uppercase label for compact badges/tabs (e.g. 'VI', 'EN', 'ZH') */
  shortLabel: string;
  /** Is this the primary/default system language? */
  isDefault?: boolean;
  /** Whether this language is active in the UI */
  enabled: boolean;
}

export const SYSTEM_LANGUAGES: SystemLanguage[] = [
  {
    code: "vi",
    name: "Tiếng Việt",
    nativeName: "Tiếng Việt",
    flag: "🇻🇳",
    shortLabel: "VI",
    isDefault: true,
    enabled: true,
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    shortLabel: "EN",
    enabled: true,
  },
  // Các ngôn ngữ chuẩn bị sẵn cho lộ trình quốc tế hóa (khi kích hoạt chỉ cần đổi enabled: true)
  {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    flag: "🇨🇳",
    shortLabel: "ZH",
    enabled: false,
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    shortLabel: "JA",
    enabled: false,
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    shortLabel: "KO",
    enabled: false,
  },
];

export const DEFAULT_LANGUAGE_CODE = "vi";

/**
 * Returns all currently active system languages
 */
export function getActiveSystemLanguages(): SystemLanguage[] {
  return SYSTEM_LANGUAGES.filter((l) => l.enabled);
}

/**
 * Find metadata of a system language by its code
 */
export function getSystemLanguage(code?: string): SystemLanguage | undefined {
  if (!code) return undefined;
  return SYSTEM_LANGUAGES.find(
    (l) => l.code.toLowerCase() === code.toLowerCase(),
  );
}

/**
 * Helper to get default language metadata
 */
export function getDefaultSystemLanguage(): SystemLanguage {
  return (
    SYSTEM_LANGUAGES.find((l) => l.isDefault) ||
    SYSTEM_LANGUAGES[0] || {
      code: "vi",
      name: "Tiếng Việt",
      nativeName: "Tiếng Việt",
      flag: "🇻🇳",
      shortLabel: "VI",
      isDefault: true,
      enabled: true,
    }
  );
}
