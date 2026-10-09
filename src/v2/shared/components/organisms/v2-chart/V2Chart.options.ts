import type { ChartData, ChartOptions } from "chart.js";
import type { V2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";
import {
  capV2Series,
  getV2SeriesColor,
  withAlpha,
} from "@/v2/shared/utils/v2ChartPalette";
import type { V2ChartSeries } from "./V2Chart.type";

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
