import { describe, expect, it } from "vitest";
import {
  V2_CHART_MAX_SERIES,
  V2_CHART_SERIES,
  capV2Series,
  getV2SeriesColor,
  withAlpha,
} from "./v2ChartPalette";

describe("v2ChartPalette", () => {
  it("has the same number of slots in both modes and no blue hues", () => {
    expect(V2_CHART_SERIES.light).toHaveLength(V2_CHART_MAX_SERIES);
    expect(V2_CHART_SERIES.dark).toHaveLength(V2_CHART_MAX_SERIES);
    for (const hex of [...V2_CHART_SERIES.light, ...V2_CHART_SERIES.dark]) {
      const r = parseInt(hex.slice(1, 3), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      // xanh dương thuần: kênh B vượt trội cả R và G
      expect(b > r + 40 && b > g + 40).toBe(false);
    }
  });

  it("returns colours in fixed order", () => {
    expect(getV2SeriesColor(0, "light")).toBe(V2_CHART_SERIES.light[0]);
    expect(getV2SeriesColor(1, "dark")).toBe(V2_CHART_SERIES.dark[1]);
  });

  it("refuses to cycle past the last slot", () => {
    expect(() => getV2SeriesColor(V2_CHART_MAX_SERIES, "light")).toThrow(
      RangeError,
    );
  });

  it("keeps series as is when within the limit", () => {
    const series = [{ key: "a", label: "A", data: [1] }];
    expect(capV2Series(series, "Khác")).toBe(series);
  });

  it("folds the tail into an Other series", () => {
    const series = Array.from({ length: 8 }, (_, i) => ({
      key: `s${i}`,
      label: `S${i}`,
      data: [1, 2],
    }));
    const capped = capV2Series(series, "Khác");
    expect(capped).toHaveLength(V2_CHART_MAX_SERIES);
    expect(capped[capped.length - 1]).toEqual({
      key: "__other",
      label: "Khác",
      data: [4, 8],
    });
  });

  it("adds an alpha channel", () => {
    expect(withAlpha("#4a3aa7", 0.1)).toBe("#4a3aa71a");
    expect(withAlpha("#4a3aa7", 2)).toBe("#4a3aa7ff");
  });
});
