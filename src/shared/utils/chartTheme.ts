import { useAppStore } from "@/core/config/appStore";

export function useChartTheme() {
  const { appTheme } = useAppStore();
  const isDark = appTheme === "midnight" || appTheme === "orcaq";
  if (appTheme === "midnight") {
    return {
      isDark: true,
      gridColor: "#27272a",
      tickColor: "#a1a1aa",
      borderColor: "#18181b",
    };
  }
  if (isDark) {
    return {
      isDark: true,
      gridColor: "#263142",
      tickColor: "#8892a6",
      borderColor: "#131a22",
    };
  }
  return {
    isDark: false,
    gridColor: "#f0f0ee",
    tickColor: "#aaa",
    borderColor: "#ffffff",
  };
}
