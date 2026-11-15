import type { ChartData, ChartOptions } from "chart.js";
import type { V2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";
import {
  getV2SeriesColor,
  withAlpha,
  V2_CHART_MAX_SERIES,
} from "@/v2/shared/utils/v2ChartPalette";
import type { V2ComboSeries } from "./V2Chart.type";
import { axes, tooltipStyle } from "./V2Chart.options";
import type { Format } from "./V2Chart.options";

export const prepareComboSeries = (
  series: V2ComboSeries[],
  theme: V2ChartTheme,
) => ({
  series,
  colors: series.map(
    (s, index) =>
      s.color ?? getV2SeriesColor(index % V2_CHART_MAX_SERIES, theme.mode),
  ),
});

export const buildComboData = (
  labels: string[],
  series: V2ComboSeries[],
  colors: string[],
  theme: V2ChartTheme,
  stacked: boolean,
): ChartData<"bar" | "line"> => ({
  labels,
  datasets: series.map((s, index) => {
    const isLine = s.type === "line";
    const color = colors[index] || s.color || theme.textPrimary;
    const borderColor = s.borderColor ?? color;

    if (isLine) {
      const isDense = labels.length > 36;
      return {
        type: "line" as const,
        label: s.label,
        data: s.data,
        borderColor,
        backgroundColor: color,
        fill: false,
        borderWidth: s.borderWidth ?? 2.5,
        borderJoinStyle: "round" as const,
        borderCapStyle: "round" as const,
        tension: s.tension ?? 0.3,
        pointRadius:
          s.pointRadius !== undefined ? s.pointRadius : isDense ? 0 : 4,
        pointHoverRadius: s.pointHoverRadius ?? 6,
        pointHitRadius: 12,
        pointBackgroundColor: color,
        pointBorderColor: theme.surface,
        pointBorderWidth: 2,
        order: 0,
        yAxisID: s.secondaryAxis ? "y1" : "y",
      };
    }

    const isDenseBars = labels.length > 36;
    return {
      type: "bar" as const,
      label: s.label,
      tooltipLabel: s.tooltipLabel,
      data: s.data,
      backgroundColor:
        s.fillAlpha !== undefined ? withAlpha(color, s.fillAlpha) : color,
      borderColor: theme.surface,
      borderWidth: stacked ? (isDenseBars ? 0 : 2) : 0,
      borderRadius: { topLeft: 4, topRight: 4 },
      borderSkipped: "start" as const,
      maxBarThickness: 24,
      order: 1,
      stack: stacked ? "stack-0" : undefined,
      yAxisID: s.secondaryAxis ? "y1" : "y",
    };
  }),
});

export const buildComboOptions = (
  theme: V2ChartTheme,
  format: Format,
  stacked: boolean,
  hasSecondary: boolean,
  secondaryFormat?: Format,
  onBarClick?: (periodIndex: number, datasetIndex: number, event: any) => void,
): ChartOptions<"bar" | "line"> => {
  const baseAxes = axes(theme, format, stacked, false);
  const scales: any = {
    x: baseAxes.x,
    y: baseAxes.y,
  };

  if (hasSecondary) {
    scales.y1 = {
      position: "right",
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: theme.textMuted,
        callback: (tick: string | number) =>
          secondaryFormat ? secondaryFormat(Number(tick)) : `${tick}%`,
      },
    };
  }

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    onClick: onBarClick
      ? (event, elements) => {
          if (elements && elements.length > 0) {
            onBarClick(elements[0].index, elements[0].datasetIndex, event);
          }
        }
      : undefined,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipStyle(theme),
        callbacks: {
          label: (ctx: any) => {
            const isSecondary = ctx.dataset.yAxisID === "y1";
            const val = Number(ctx.parsed.y);
            if (!isSecondary && val <= 0) {
              return undefined;
            }
            const valFormatted =
              isSecondary && secondaryFormat
                ? secondaryFormat(val)
                : format(val);
            const name =
              (ctx.dataset as { tooltipLabel?: string }).tooltipLabel ??
              ctx.dataset.label ??
              "";
            return `${name}: ${valFormatted}`;
          },
        },
      },
    },
    scales,
  };
};
