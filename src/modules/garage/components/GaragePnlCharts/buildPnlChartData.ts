import type { GaragePnlTrendPoint } from "../../api/garageOpexApi";

/**
 * Bảng màu theo tông chart Dòng tiền (xanh lá #059669 = thu, cam #ea580c = chi), đã chạy
 * validate_palette. Thứ tự slot: Doanh thu, Chi phí, Lợi nhuận gộp, Đỏ, Tím, Teal, Vàng.
 */
const PNL_PALETTE_LIGHT = [
  "#059669",
  "#EA580C",
  "#475569",
  "#E11D48",
  "#7C3AED",
  "#0D9488",
  "#CA8A04",
] as const;

const PNL_PALETTE_DARK = [
  "#059669",
  "#EA580C",
  "#64748B",
  "#E11D48",
  "#7C3AED",
  "#0D9488",
  "#A87B04",
] as const;

export const getPnlPalette = (isDark: boolean) =>
  isDark ? PNL_PALETTE_DARK : PNL_PALETTE_LIGHT;

/** 476230000 -> "476.2tr", 1250000000 -> "1250tr"; giống nhãn của chart Excel. */
export const formatMillions = (v: number) =>
  `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}tr`;

export const formatPercent = (ratio: number) => `${Math.round(ratio * 100)}%`;

export interface PnlRatioLabels {
  cogs: string;
  nhanSu: string;
  matBang: string;
  vatTu: string;
  baoTri: string;
  khauHao: string;
  khac: string;
}

export interface PnlTrendLabels {
  revenue: string;
  cost: string;
  profit: string;
  margin: string;
}

export function buildTrendChartData(
  points: GaragePnlTrendPoint[],
  labels: PnlTrendLabels,
  isDark = false,
) {
  const palette = getPnlPalette(isDark);
  return {
    labels: points.map((p) => p.label),
    datasets: [
      {
        label: labels.revenue,
        data: points.map((p) => p.revenue),
        color: palette[0],
        format: formatMillions,
      },
      {
        label: labels.cost,
        data: points.map((p) => p.cogs),
        color: palette[1],
        format: formatMillions,
      },
      {
        label: labels.profit,
        data: points.map((p) => p.grossProfit),
        color: palette[2],
        format: formatMillions,
      },
      {
        label: labels.margin,
        // null ngắt đường ở tháng không có doanh thu (giống Excel)
        data: points.map((p) => p.grossMarginRatio) as unknown as number[],
        color: palette[5],
        type: "line" as const,
        borderColor: palette[5],
        borderWidth: 2,
        fill: false,
        secondaryAxis: true,
        format: formatPercent,
      },
    ],
  };
}

const RATIO_KEYS = [
  "cogs",
  "nhanSu",
  "matBang",
  "vatTu",
  "baoTri",
  "khauHao",
  "khac",
] as const;

export function buildRatioChartData(
  points: GaragePnlTrendPoint[],
  labels: PnlRatioLabels,
  isDark = false,
) {
  const palette = getPnlPalette(isDark);
  return {
    labels: points.map((p) => p.label),
    datasets: RATIO_KEYS.map((key, i) => ({
      label: labels[key],
      data: points.map((p) => p.ratios[key]),
      color: palette[i],
      format: formatPercent,
    })),
  };
}
