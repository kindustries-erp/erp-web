import { describe, expect, it } from "vitest";
import {
  generateQuarterOptions,
  initQuarter,
  quarterFirstDay,
  quarterFromExactRange,
  quarterLastDay,
} from "./exportPeriod";

describe("exportPeriod quarter helpers", () => {
  it("returns first and last day of a quarter", () => {
    expect(quarterFirstDay("2026-Q2")).toBe("2026-04-01");
    expect(quarterLastDay("2026-Q2")).toBe("2026-06-30");
    expect(quarterLastDay("2026-Q4")).toBe("2026-12-31");
  });

  it("returns empty string for malformed quarter keys", () => {
    expect(quarterFirstDay("2026-03")).toBe("");
    expect(quarterLastDay("")).toBe("");
  });

  it("derives the quarter key from an exact range only", () => {
    expect(quarterFromExactRange("2026-07-01", "2026-09-30")).toBe("2026-Q3");
    expect(quarterFromExactRange("2026-07-01", "2026-09-29")).toBe("");
    expect(quarterFromExactRange("2026-07-01", "2027-09-30")).toBe("");
  });

  it("initQuarter uses the given date", () => {
    expect(initQuarter(new Date(2026, 10, 5))).toBe("2026-Q4");
  });

  it("lists current-year quarters newest first, capped at the current quarter", () => {
    const options = generateQuarterOptions(1, new Date(2026, 4, 1));
    expect(options.map((o) => o.value)).toEqual([
      "2026-Q2",
      "2026-Q1",
      "2025-Q4",
      "2025-Q3",
      "2025-Q2",
      "2025-Q1",
    ]);
    expect(options[0].label).toBe("Quý 2/2026 (01/04 - 30/06/2026)");
  });
});
