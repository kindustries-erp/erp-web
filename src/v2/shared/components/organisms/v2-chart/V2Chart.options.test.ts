import { describe, expect, it } from "vitest";
import type { V2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";
import {
  buildBarData,
  buildBarOptions,
  buildLineData,
  buildLineOptions,
  prepareSeries,
} from "./V2Chart.options";
import { buildDonutData, foldSlices } from "./V2Chart.donut.options";

const theme: V2ChartTheme = {
  mode: "light",
  surface: "#ffffff",
  textPrimary: "#0f172a",
  textSecondary: "#52525b",
  textMuted: "#71717a",
  grid: "#eef0f3",
};

const series = [
  { key: "in", label: "Mua vào", data: [1, 2] },
  { key: "out", label: "Bán ra", data: [3, 4] },
];

describe("prepareSeries", () => {
  it("assigns colours in fixed order", () => {
    const { colors } = prepareSeries(series, "Khác", theme);
    expect(colors).toEqual(["#eb6834", "#1baf7a"]);
  });

  it("folds series beyond the palette into Other", () => {
    const many = Array.from({ length: 7 }, (_, i) => ({
      key: `s${i}`,
      label: `S${i}`,
      data: [1],
    }));
    const prepared = prepareSeries(many, "Khác", theme);
    expect(prepared.series).toHaveLength(5);
    expect(prepared.series[4]).toMatchObject({ key: "__other", data: [3] });
    expect(prepared.colors).toHaveLength(5);
  });
});

describe("bar builders", () => {
  it("caps bar thickness and rounds only the data end", () => {
    const data = buildBarData(
      ["T1", "T2"],
      series,
      ["#a", "#b"],
      theme,
      false,
      false,
    );
    expect(data.datasets[0]).toMatchObject({
      maxBarThickness: 24,
      borderRadius: { topLeft: 4, topRight: 4 },
      borderSkipped: "start",
      borderWidth: 0,
    });
  });

  it("uses a 2px surface gap for stacked bars", () => {
    const data = buildBarData(["T1"], series, ["#a", "#b"], theme, true, false);
    expect(data.datasets[0]).toMatchObject({
      borderColor: "#ffffff",
      borderWidth: 2,
    });
  });

  it("rounds the right end for horizontal bars", () => {
    const data = buildBarData(["T1"], series, ["#a", "#b"], theme, false, true);
    expect(data.datasets[0]?.borderRadius).toEqual({
      topRight: 4,
      bottomRight: 4,
    });
    expect(buildBarOptions(theme, String, false, true).indexAxis).toBe("y");
  });

  it("hides the built-in legend (the frame renders it) and formats ticks", () => {
    const options = buildBarOptions(theme, (v) => `${v}đ`, false, false);
    expect(options.plugins?.legend?.display).toBe(false);
    const yTicks = (options.scales as any).y.ticks;
    expect(yTicks.callback(1000)).toBe("1000đ");
    expect((options.scales as any).y.grid.lineWidth).toBe(1);
  });
});

describe("line builders", () => {
  it("draws 2px lines with 8px markers ringed in the surface colour", () => {
    const data = buildLineData(
      ["T1", "T2"],
      series,
      ["#a", "#b"],
      theme,
      false,
    );
    expect(data.datasets[0]).toMatchObject({
      borderWidth: 2,
      pointRadius: 4,
      pointBorderWidth: 2,
      pointBorderColor: "#ffffff",
      fill: false,
    });
  });

  it("adds a ~10% wash for area charts", () => {
    const data = buildLineData(
      ["T1"],
      series,
      ["#eb6834", "#1baf7a"],
      theme,
      true,
    );
    expect(data.datasets[0]).toMatchObject({
      fill: true,
      backgroundColor: "#eb68341a",
    });
  });

  it("formats tooltip values", () => {
    const options = buildLineOptions(theme, (v) => `${v}đ`);
    const label = (options.plugins as any).tooltip.callbacks.label;
    expect(label({ dataset: { label: "Mua vào" }, parsed: { y: 5 } })).toBe(
      "Mua vào: 5đ",
    );
  });
});

describe("donut builders", () => {
  it("keeps slices up to the palette size", () => {
    expect(foldSlices(["a", "b"], [1, 2], "Khác")).toEqual({
      labels: ["a", "b"],
      values: [1, 2],
    });
  });

  it("folds the smallest tail into Other", () => {
    const folded = foldSlices(
      ["a", "b", "c", "d", "e", "f", "g"],
      [1, 2, 3, 4, 5, 6, 7],
      "Khác",
    );
    expect(folded.labels).toEqual(["a", "b", "c", "d", "Khác"]);
    expect(folded.values).toEqual([1, 2, 3, 4, 18]);
  });

  it("separates slices with a 2px surface gap", () => {
    const data = buildDonutData(["a"], [1], ["#eb6834"], theme);
    expect(data.datasets[0]).toMatchObject({
      borderColor: "#ffffff",
      borderWidth: 2,
    });
  });
});
