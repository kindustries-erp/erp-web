import { describe, it, expect } from "vitest";
import {
  buildRatioChartData,
  buildTrendChartData,
  formatMillions,
  formatPercent,
  getPnlPalette,
} from "./buildPnlChartData";
import type { GaragePnlTrendPoint } from "../../api/garageOpexApi";

const point = (over: Partial<GaragePnlTrendPoint>): GaragePnlTrendPoint => ({
  year: 2026,
  month: 10,
  label: "2026-thg 10",
  revenue: 179_070_000,
  cogs: 140_115_320,
  grossProfit: 38_954_680,
  grossMarginRatio: 0.2175,
  ratios: {
    cogs: 0.78,
    nhanSu: 0.43,
    matBang: 0.17,
    vatTu: 0.06,
    baoTri: 0.03,
    khauHao: 0.03,
    khac: 0,
  },
  ...over,
});

describe("buildPnlChartData", () => {
  it("định dạng nhãn tiền và %", () => {
    expect(formatMillions(476_230_000)).toBe("476.2tr");
    expect(formatMillions(100_000_000)).toBe("100tr");
    expect(formatPercent(0.4349)).toBe("43%");
  });

  it("combo: 3 cột + đường % trên trục phụ, null giữ nguyên để ngắt đường", () => {
    const d = buildTrendChartData(
      [point({}), point({ revenue: 0, grossMarginRatio: null })],
      { revenue: "DT", cost: "CP", profit: "LN", margin: "%" },
    );
    expect(d.datasets.map((x) => x.label)).toEqual(["DT", "CP", "LN", "%"]);
    expect(d.datasets[3].secondaryAxis).toBe(true);
    expect(d.datasets[3].type).toBe("line");
    expect(d.datasets[3].data).toEqual([0.2175, null]);
    expect(d.datasets[0].data[0]).toBe(179_070_000);
  });

  it("tỷ trọng: 7 series đúng thứ tự như Excel", () => {
    const labels = {
      cogs: "a",
      nhanSu: "b",
      matBang: "c",
      vatTu: "d",
      baoTri: "e",
      khauHao: "f",
      khac: "g",
    };
    const d = buildRatioChartData([point({})], labels);
    expect(d.datasets.map((x) => x.label)).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
    ]);
    expect(d.datasets[1].data).toEqual([0.43]);
  });

  it("palette: 7 slot, bản dark khác light; đường % dùng slot teal", () => {
    expect(getPnlPalette(false)).toHaveLength(7);
    expect(getPnlPalette(true)).not.toEqual(getPnlPalette(false));
    const labels = { revenue: "a", cost: "b", profit: "c", margin: "d" };
    const light = buildTrendChartData([point({})], labels);
    expect(light.datasets[0].color).toBe("#059669");
    expect(light.datasets[1].color).toBe("#EA580C");
    expect(light.datasets[3].color).toBe("#0D9488");
    const dark = buildTrendChartData([point({})], labels, true);
    expect(dark.datasets[2].color).toBe("#64748B");
  });
});
