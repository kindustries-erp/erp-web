import { PNL_PALETTE_LIGHT } from "../GaragePnlCharts/buildPnlChartData";

/** Trộn hex với trắng theo tỉ lệ `amount` (0 = giữ nguyên, 1 = trắng). Kết quả là hex cố định. */
export function mixWithWhite(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) =>
    parseInt(clean.slice(offset, offset + 2), 16),
  );
  const mixed = channels.map((value) =>
    Math.round(value + (255 - value) * amount),
  );
  return `#${mixed.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

export interface TonePalette {
  /** Nền thanh tiêu đề lane/cột (nhạt). */
  header: string;
  /** Nền thân lane (rất nhạt). */
  body: string;
  /** Viền lane. */
  border: string;
  /** Chữ và icon tiêu đề (đậm hơn màu gốc). */
  text: string;
  /** Màu gốc, dùng cho vạch màu bên trái. */
  accent: string;
}

/** Bảng màu nhạt cho một màu chart: header, thân, viền, chữ và vạch. */
export function tonePalette(hex: string): TonePalette {
  return {
    header: mixWithWhite(hex, 0.86),
    body: mixWithWhite(hex, 0.96),
    border: mixWithWhite(hex, 0.55),
    text: darken(hex, 0.3),
    accent: hex,
  };
}

/** Làm tối màu theo tỉ lệ `amount` (0 = giữ nguyên, 1 = đen). */
export function darken(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) =>
    parseInt(clean.slice(offset, offset + 2), 16),
  );
  const mixed = channels.map((value) => Math.round(value * (1 - amount)));
  return `#${mixed.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

/** Màu theo nghĩa nghiệp vụ, lấy từ bảng màu chart dashboard. */
export const WORKFLOW_BUSINESS_COLORS = {
  income: PNL_PALETTE_LIGHT[0],
  expense: PNL_PALETTE_LIGHT[1],
  neutral: PNL_PALETTE_LIGHT[2],
  receivable: PNL_PALETTE_LIGHT[3],
  report: PNL_PALETTE_LIGHT[4],
  system: PNL_PALETTE_LIGHT[5],
  warning: PNL_PALETTE_LIGHT[6],
} as const;

/** Màu gốc của từng tên màu lane, lấy từ bảng chart dashboard. */
export const TONE_BASE = {
  slate: "#475569",
  teal: "#0D9488",
  gold: "#CA8A04",
  green: "#059669",
  orange: "#EA580C",
  rose: "#E11D48",
  violet: "#7C3AED",
} as const;
