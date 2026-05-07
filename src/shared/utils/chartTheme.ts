import { useAppStore } from '@/core/config/appStore'

export function useChartTheme() {
  const isDark = useAppStore((s) => s.isDark)
  return {
    isDark,
    gridColor: isDark ? '#333336' : '#f0f0ee',
    tickColor: isDark ? '#666' : '#aaa',
    borderColor: isDark ? '#1f1f21' : '#ffffff',
  }
}
