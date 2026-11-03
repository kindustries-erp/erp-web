import type { ChartData, ChartOptions } from "chart.js";
import type { V2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";
import {
  capV2Series,
  getV2SeriesColor,
  withAlpha,
  V2_CHART_MAX_SERIES,
} from "@/v2/shared/utils/v2ChartPalette";
import type { V2ChartSeries, V2ComboSeries } from "./V2Chart.type";

type Format = (value: number) => string;

export const defaultFormat: Format = (value) => value.toLocaleString("vi-VN");

/** Giới hạn số chuỗi và gán màu theo thứ tự cố định */
export const prepareSeries = (
  series: V2ChartSeries[],
  otherLabel: string,
  theme: V2ChartTheme,
) => {
  const capped = capV2Series(series, otherLabel);
  return {
    series: capped,
    colors: capped.map((_, index) => getV2SeriesColor(index, theme.mode)),
  };
};

export const tooltipStyle = (theme: V2ChartTheme) => ({
  backgroundColor: theme.surface,
  titleColor: theme.textPrimary,
  bodyColor: theme.textSecondary,
  borderColor: theme.grid,
  borderWidth: 1,
  padding: 10,
  boxPadding: 4,
  usePointStyle: true,
});

const axes = (
  theme: V2ChartTheme,
  format: Format,
  stacked: boolean,
  horizontal: boolean,
) => {
  const category = {
    stacked,
    grid: { display: horizontal, color: theme.grid, lineWidth: 1 },
    border: { display: false },
    ticks: { color: theme.textMuted },
  };
  const value = {
    stacked,
    beginAtZero: true,
    grid: { display: !horizontal, color: theme.grid, lineWidth: 1 },
    border: { display: false },
    ticks: {
      color: theme.textMuted,
      callback: (tick: string | number) => format(Number(tick)),
    },
  };
  return horizontal ? { x: value, y: category } : { x: category, y: value };
};

export const buildBarData = (
  labels: string[],
  series: V2ChartSeries[],
  colors: string[],
  theme: V2ChartTheme,
  stacked: boolean,
  horizontal: boolean,
): ChartData<"bar"> => ({
  labels,
  datasets: series.map((s, index) => ({
    label: s.label,
    data: s.data,
    backgroundColor: colors[index],
    borderRadius: horizontal
      ? { topRight: 4, bottomRight: 4 }
      : { topLeft: 4, topRight: 4 },
    borderSkipped: "start",
    maxBarThickness: 24,
    borderColor: theme.surface,
    borderWidth: stacked ? 2 : 0,
  })),
});

export const buildBarOptions = (
  theme: V2ChartTheme,
  format: Format,
  stacked: boolean,
  horizontal: boolean,
): ChartOptions<"bar"> => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: horizontal ? "y" : "x",
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      ...tooltipStyle(theme),
      callbacks: {
        label: (ctx) =>
          `${ctx.dataset.label ?? ""}: ${format(Number(ctx.parsed[horizontal ? "x" : "y"]))}`,
      },
    },
  },
  scales: axes(theme, format, stacked, horizontal),
});

export const buildLineData = (
  labels: string[],
  series: V2ChartSeries[],
  colors: string[],
  theme: V2ChartTheme,
  area: boolean,
): ChartData<"line"> => ({
  labels,
  datasets: series.map((s, index) => ({
    label: s.label,
    data: s.data,
    borderColor: colors[index],
    backgroundColor: area
      ? withAlpha(colors[index] ?? "#000000", 0.1)
      : colors[index],
    fill: area,
    borderWidth: 2,
    borderJoinStyle: "round",
    borderCapStyle: "round",
    tension: 0.25,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointHitRadius: 12,
    pointBackgroundColor: colors[index],
    pointBorderColor: theme.surface,
    pointBorderWidth: 2,
  })),
});

export const buildLineOptions = (
  theme: V2ChartTheme,
  format: Format,
): ChartOptions<"line"> => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      ...tooltipStyle(theme),
      callbacks: {
        label: (ctx) =>
          `${ctx.dataset.label ?? ""}: ${format(Number(ctx.parsed.y))}`,
      },
    },
  },
  scales: axes(theme, format, false, false),
});

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
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHitRadius: 12,
        pointBackgroundColor: color,
        pointBorderColor: theme.surface,
        pointBorderWidth: 2,
        order: 0,
        yAxisID: s.secondaryAxis ? "y1" : "y",
      };
    }

    return {
      type: "bar" as const,
      label: s.label,
      data: s.data,
      backgroundColor: color,
      borderColor: theme.surface,
      borderWidth: stacked ? 2 : 0,
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
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipStyle(theme),
        callbacks: {
          label: (ctx: any) => {
            const isSecondary = ctx.dataset.yAxisID === "y1";
            const val = Number(ctx.parsed.y);
            const valFormatted =
              isSecondary && secondaryFormat
                ? secondaryFormat(val)
                : format(val);
            return `${ctx.dataset.label ?? ""}: ${valFormatted}`;
          },
        },
      },
    },
    scales,
  };
};
