import { describe, expect, it } from "vitest";
import type { V2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";
import type { V2ComboSeries } from "./V2Chart.type";
import { buildComboData, buildComboOptions } from "./V2Chart.combo.options";

const theme: V2ChartTheme = {
  mode: "light",
  surface: "#ffffff",
  textPrimary: "#0f172a",
  textSecondary: "#52525b",
  textMuted: "#71717a",
  grid: "#eef0f3",
};

const format = (value: number) => `#${value}`;

const series: V2ComboSeries[] = [
  {
    key: "paid",
    label: "Vay A",
    type: "bar",
    data: [100, 0],
    color: "#ea580c",
    tooltipLabel: "Vay A – Đã trả",
  },
  {
    key: "unpaid",
    label: "Vay A",
    type: "bar",
    data: [0, 50],
    color: "#ea580c",
    fillAlpha: 0.35,
    legendHidden: true,
    tooltipLabel: "Vay A – Còn phải trả",
  },
  {
    key: "plain",
    label: "Vay B",
    type: "bar",
    data: [10, 10],
    color: "#059669",
  },
];

const colors = series.map((s) => s.color as string);

describe("buildComboData", () => {
  it("tô nền có alpha khi có fillAlpha, giữ màu gốc khi không có", () => {
    const data = buildComboData(["T1", "T2"], series, colors, theme, true);
    const [paid, unpaid, plain] = data.datasets as any[];

    expect(paid.backgroundColor).toBe("#ea580c");
    expect(unpaid.backgroundColor).toBe("#ea580c59");
    expect(plain.backgroundColor).toBe("#059669");
  });

  it("gắn tooltipLabel vào dataset cột", () => {
    const data = buildComboData(["T1", "T2"], series, colors, theme, true);
    const [paid, unpaid, plain] = data.datasets as any[];

    expect(paid.tooltipLabel).toBe("Vay A – Đã trả");
    expect(unpaid.tooltipLabel).toBe("Vay A – Còn phải trả");
    expect(plain.tooltipLabel).toBeUndefined();
  });

  it("tự động đặt pointRadius: 0 và borderWidth: 0 khi labels.length > 36", () => {
    const denseLabels = Array.from({ length: 48 }, (_, i) => `T${i + 1}`);
    const lineAndBarSeries: V2ComboSeries[] = [
      { key: "line1", label: "Line 1", type: "line", data: Array(48).fill(10) },
      { key: "bar1", label: "Bar 1", type: "bar", data: Array(48).fill(20) },
    ];
    const data = buildComboData(
      denseLabels,
      lineAndBarSeries,
      ["#ea580c", "#059669"],
      theme,
      true,
    );
    const [lineDs, barDs] = data.datasets as any[];

    expect(lineDs.pointRadius).toBe(0);
    expect(barDs.borderWidth).toBe(0);
  });
});

describe("buildComboOptions tooltip", () => {
  const options = buildComboOptions(theme, format, true, false);
  const label = (options.plugins as any).tooltip.callbacks.label as (
    ctx: any,
  ) => string;

  it("dùng tooltipLabel thay cho label của dataset", () => {
    const text = label({
      dataset: { label: "Vay A", tooltipLabel: "Vay A – Đã trả", yAxisID: "y" },
      parsed: { y: 1000 },
    });
    expect(text).toBe("Vay A – Đã trả: #1000");
  });

  it("dùng label của dataset khi không có tooltipLabel", () => {
    const text = label({
      dataset: { label: "Vay B", yAxisID: "y" },
      parsed: { y: 20 },
    });
    expect(text).toBe("Vay B: #20");
  });
});
