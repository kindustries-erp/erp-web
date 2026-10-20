import type { ChartData, ChartOptions } from "chart.js";
import type { V2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";
import { V2_CHART_MAX_SERIES } from "@/v2/shared/utils/v2ChartPalette";
import { tooltipStyle } from "./V2Chart.options";

type Format = (value: number) => string;

/** Gộp các mảng nhỏ cuối thành "Khác" khi vượt số màu tối đa */
export const foldSlices = (
  labels: string[],
  values: number[],
  otherLabel: string,
) => {
  if (values.length <= V2_CHART_MAX_SERIES) return { labels, values };
  const keep = V2_CHART_MAX_SERIES - 1;
  const rest = values.slice(keep).reduce((sum, v) => sum + v, 0);
  return {
    labels: [...labels.slice(0, keep), otherLabel],
    values: [...values.slice(0, keep), rest],
  };
};

export const buildDonutData = (
  labels: string[],
  values: number[],
  colors: string[],
  theme: V2ChartTheme,
): ChartData<"doughnut"> => ({
  labels,
  datasets: [
    {
      data: values,
      backgroundColor: colors,
      borderColor: theme.surface,
      borderWidth: 2,
      hoverOffset: 4,
    },
  ],
});

export const buildDonutOptions = (
  theme: V2ChartTheme,
  format: Format,
): ChartOptions<"doughnut"> => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  plugins: {
    legend: { display: false },
    tooltip: {
      ...tooltipStyle(theme),
      callbacks: {
        label: (ctx) => `${ctx.label}: ${format(Number(ctx.parsed))}`,
      },
    },
  },
});
