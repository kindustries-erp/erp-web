import { useAppStore } from '@/core/config/appStore'

export function useChartTheme() {
  return {
    isDark: false,
    gridColor: '#f0f0ee',
    tickColor: '#aaa',
    borderColor: '#ffffff',
  }
}
