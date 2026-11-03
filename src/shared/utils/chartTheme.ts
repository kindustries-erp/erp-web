import { useAppStore } from "@/core/config/appStore";

export function useChartTheme() {
  const { appTheme } = useAppStore();
  const isDocDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const isDark =
    isDocDark ||
    appTheme === "midnight" ||
    appTheme === "orcaq" ||
    appTheme === "classic-dark";

  if (isDark) {
    return {
      isDark: true,
      gridColor: "rgba(255, 255, 255, 0.06)",
      tickColor: "#94a3b8",
      borderColor: "rgba(255, 255, 255, 0.08)",
    };
  }

  return {
    isDark: false,
    gridColor: "rgba(0, 0, 0, 0.06)",
    tickColor: "#64748b",
    borderColor: "rgba(0, 0, 0, 0.08)",
  };
}
