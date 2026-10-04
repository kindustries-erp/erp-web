import { useCallback } from "react";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { v2Vi, v2En } from "../locales";

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

export function useV2Translation(): UseV2TranslationReturn {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const coreT = useT();

  const v2Dict = locale === "en" ? v2En : v2Vi;

  const t = useCallback(
    (
      key: string,
      optionsOrFallback?: string | { defaultValue?: string; [k: string]: any },
    ): string => {
      const fallbackStr: string =
        typeof optionsOrFallback === "object" && optionsOrFallback !== null
          ? typeof optionsOrFallback.defaultValue === "string"
            ? optionsOrFallback.defaultValue
            : key
          : typeof optionsOrFallback === "string"
            ? optionsOrFallback
            : key;

      if (!key) return fallbackStr;

      // 1. Direct or nested check in V2 Dictionary
      if (key.startsWith("v2.")) {
        const parts = key.split(".");
        let cur: any = v2Dict;
        let matched = true;
        for (const p of parts) {
          if (cur == null || typeof cur !== "object" || !(p in cur)) {
            matched = false;
            break;
          }
          cur = cur[p];
        }

        if (matched && typeof cur === "string") {
          if (
            typeof optionsOrFallback === "object" &&
            optionsOrFallback !== null
          ) {
            let interpolated = cur;
            for (const [varName, varVal] of Object.entries(optionsOrFallback)) {
              if (varName !== "defaultValue") {
                interpolated = interpolated.replace(
                  new RegExp(`{{\\s*${varName}\\s*}}`, "g"),
                  String(varVal),
                );
              }
            }
            return interpolated;
          }
          return cur;
        }
      }

      // 2. Delegate to core application translation (nav.*, topbar.*, common.*, etc.)
      const coreResult = coreT(key, optionsOrFallback);
      if (coreResult && coreResult !== key) {
        return coreResult;
      }

      return fallbackStr;
    },
    [locale, v2Dict, coreT],
  );

  return {
    locale,
    setLocale,
    t,
    isVietnamese: locale === "vi",
    isEnglish: locale === "en",
  };
}
