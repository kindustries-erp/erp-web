import { useCallback } from "react";
import i18n from "i18next";
import { useAppStore } from "@/core/config/appStore";
import { vi } from "@/core/locale/vi";
import { en } from "@/core/locale/en";

export function useT() {
  const locale = useAppStore((s) => s.locale);
  const dict = locale === "en" ? en : vi;
  return useCallback(
    function t(key: string, fallback?: string): string {
      if (key.includes(":")) {
        const value = i18n.t(key, { defaultValue: fallback ?? key });
        return typeof value === "string" ? value : (fallback ?? key);
      }

      const parts = key.split(".");
      let cur: unknown = dict;
      for (const p of parts) {
        if (cur == null || typeof cur !== "object") return fallback ?? key;
        cur = (cur as Record<string, unknown>)[p];
      }
      return typeof cur === "string" ? cur : (fallback ?? key);
    },
    [dict],
  );
}

export function useDict() {
  const locale = useAppStore((s) => s.locale);
  return locale === "en" ? en : vi;
}
