import { useMemo, useSyncExternalStore } from "react";
import type { V2ChartMode } from "@/v2/shared/utils/v2ChartPalette";

export interface V2ChartTheme {
  mode: V2ChartMode;
  /** Nền biểu đồ: dùng cho khe 2px giữa các mảng và vòng quanh điểm */
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  grid: string;
}

const subscribe = (listener: () => void) => {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
};

const getMode = (): V2ChartMode =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

const cssVar = (name: string, fallback: string): string => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
};

/** Màu nền, chữ và lưới của biểu đồ theo theme V2 đang bật (đọc từ biến CSS) */
export function useV2ChartTheme(): V2ChartTheme {
  const mode = useSyncExternalStore(subscribe, getMode, () => "light" as const);
  return useMemo(() => {
    const dark = mode === "dark";
    return {
      mode,
      surface: cssVar("--surface", dark ? "#18181b" : "#ffffff"),
      textPrimary: cssVar("--foreground", dark ? "#f4f4f5" : "#0f172a"),
      textSecondary: cssVar("--muted-fg", dark ? "#a1a1aa" : "#52525b"),
      textMuted: cssVar("--faint", dark ? "#71717a" : "#71717a"),
      grid: cssVar("--border-light", dark ? "#27272a" : "#eef0f3"),
    };
  }, [mode]);
}
