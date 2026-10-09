import { describe, expect, it } from "vitest";
import {
  buildDisabledMatchers,
  buildV2DatePresets,
  formatDisplayDate,
  parseIsoDate,
  toIsoDate,
} from "./V2DatePicker.helper";

describe("V2DatePicker helpers", () => {
  it("parses a valid ISO date and rejects invalid ones", () => {
    expect(parseIsoDate("2026-01-15")?.getDate()).toBe(15);
    expect(parseIsoDate("2026-13-40")).toBeUndefined();
    expect(parseIsoDate("")).toBeUndefined();
    expect(parseIsoDate(null)).toBeUndefined();
  });

  it("round-trips through toIsoDate", () => {
    expect(toIsoDate(parseIsoDate("2026-02-03")!)).toBe("2026-02-03");
  });

  it("formats for display as dd/MM/yyyy", () => {
    expect(formatDisplayDate("2026-01-05")).toBe("05/01/2026");
    expect(formatDisplayDate("bad")).toBe("");
  });

  it("builds disabled matchers from min and max", () => {
    expect(buildDisabledMatchers()).toEqual([]);
    const matchers = buildDisabledMatchers("2026-01-01", "2026-12-31");
    expect(matchers).toHaveLength(2);
    expect(matchers[0]).toHaveProperty("before");
    expect(matchers[1]).toHaveProperty("after");
  });
});

describe("buildV2DatePresets", () => {
  const today = new Date(2026, 4, 17);
  const presets = buildV2DatePresets((_, fallback) => fallback ?? "", today);
  const rangeOf = (key: string) => presets.find((p) => p.key === key)!.range();

  it("lists the standard presets in order", () => {
    expect(presets.map((p) => p.key)).toEqual([
      "today",
      "thisMonth",
      "lastMonth",
      "thisQuarter",
      "thisYear",
    ]);
  });

  it("computes month, quarter and year ranges", () => {
    expect(rangeOf("today")).toEqual({ from: "2026-05-17", to: "2026-05-17" });
    expect(rangeOf("thisMonth")).toEqual({
      from: "2026-05-01",
      to: "2026-05-31",
    });
    expect(rangeOf("lastMonth")).toEqual({
      from: "2026-04-01",
      to: "2026-04-30",
    });
    expect(rangeOf("thisQuarter")).toEqual({
      from: "2026-04-01",
      to: "2026-06-30",
    });
    expect(rangeOf("thisYear")).toEqual({
      from: "2026-01-01",
      to: "2026-12-31",
    });
  });
});
