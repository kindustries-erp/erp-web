import { useCallback } from "react";
import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";
import { v2Vi, v2En, lookupV2ModuleKey, walkV2Dictionary } from "../locales";

export interface UseV2TranslationReturn {
  locale: "vi" | "en";
  setLocale: (lang: "vi" | "en") => void;
  t: (
    key: string,
    optionsOrFallback?: string | { defaultValue?: string; [k: string]: any },
  ) => string;
  isVietnamese: boolean;
  isEnglish: boolean;
}

const interpolate = (
  template: string,
  values: Record<string, unknown>,
): string => {
  let result = template;
  for (const [name, value] of Object.entries(values)) {
    if (name === "defaultValue") continue;
    result = result.replace(
      new RegExp(`{{\\s*${name}\\s*}}`, "g"),
      String(value),
    );
  }
  return result;
};

/**
 * Dịch chỉ dựa trên từ điển V2 (và module đăng ký qua `registerV2ModuleLocale`).
 * Key không có tiền tố `v2.` hoặc không tìm thấy thì trả fallback, không đi sang V1.
 */
export function useV2Translation(): UseV2TranslationReturn {
  const locale = useV2LocaleStore((s) => s.locale);
  const setLocale = useV2LocaleStore((s) => s.setLocale);
  const dict = locale === "en" ? v2En : v2Vi;

  const t = useCallback(
    (
      key: string,
      optionsOrFallback?: string | { defaultValue?: string; [k: string]: any },
    ): string => {
      const options =
        typeof optionsOrFallback === "object" && optionsOrFallback !== null
          ? optionsOrFallback
          : undefined;
      const fallback =
        options !== undefined
          ? typeof options.defaultValue === "string"
            ? options.defaultValue
            : key
          : typeof optionsOrFallback === "string"
            ? optionsOrFallback
            : key;

      if (!key || !key.startsWith("v2.")) return fallback;

      const found =
        walkV2Dictionary(dict, key.split(".")) ??
        lookupV2ModuleKey(locale, key);
      if (typeof found !== "string") return fallback;

      return options ? interpolate(found, options) : found;
    },
    [locale, dict],
  );

  return {
    locale,
    setLocale,
    t,
    isVietnamese: locale === "vi",
    isEnglish: locale === "en",
  };
}
