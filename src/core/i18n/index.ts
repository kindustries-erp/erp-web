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
      if (!key) return fallback ?? "";

      // 1. Direct key match in dictionary (flat strings, full sentences with punctuation, labels with colons)
      if (
        dict != null &&
        typeof dict === "object" &&
        Object.prototype.hasOwnProperty.call(dict, key)
      ) {
        const directVal = (dict as Record<string, unknown>)[key];
        if (typeof directVal === "string") return directVal;
      }

      // 2. Namespaced key via i18next (only if key contains ":" and does not end with ":")
      if (key.includes(":") && !key.endsWith(":") && !key.startsWith(":")) {
        const value = i18n.t(key, { defaultValue: fallback ?? key });
        if (typeof value === "string" && value !== key) return value;
      }

      // 3. Nested path in dictionary (e.g. "common.save", "nav.dashboard")
      const parts = key.split(".");
      let cur: unknown = dict;
      let matched = true;
      for (const p of parts) {
        if (
          cur == null ||
          typeof cur !== "object" ||
          !(p in (cur as Record<string, unknown>))
        ) {
          matched = false;
          break;
        }
        cur = (cur as Record<string, unknown>)[p];
      }
      if (matched && typeof cur === "string") return cur;

      // 4. Fallback to i18next if available
      if (i18n.isInitialized && i18n.exists(key)) {
        const value = i18n.t(key, { defaultValue: fallback ?? key });
        if (typeof value === "string") return value;
      }

      return fallback ?? key;
    },
    [dict],
  );
}

export function useDict() {
  const locale = useAppStore((s) => s.locale);
  return locale === "en" ? en : vi;
}
