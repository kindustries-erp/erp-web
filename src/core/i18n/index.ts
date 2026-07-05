import { useCallback } from "react";
import { useAppStore } from "@/core/config/appStore";
import { vi } from "@/core/locale/vi";
import { en } from "@/core/locale/en";

export function useT() {
  const locale = useAppStore((s) => s.locale);
  const dict = locale === "en" ? en : vi;
  return useCallback(
    function t(key: string, fallback?: string): string {
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
