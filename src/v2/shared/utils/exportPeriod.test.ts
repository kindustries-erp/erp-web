import { describe, expect, it } from "vitest";
import {
  generateMonthOptions,
  generateQuarterOptions,
  generateYearOptions,
  initMonth,
  initQuarter,
  initYear,
  isDateRangeInvalid,
  monthFirstDay,
  monthFromExactRange,
  monthLastDay,
  quarterFirstDay,
  quarterFromExactRange,
  quarterLastDay,
  yearFirstDay,
  yearFromExactRange,
  yearLastDay,
} from "./exportPeriod";

describe("exportPeriod month helpers", () => {
  it("returns first and last day of a month, including leap February", () => {
    expect(monthFirstDay("2026-10")).toBe("2026-10-01");
    expect(monthLastDay("2026-10")).toBe("2026-10-31");
    expect(monthLastDay("2028-02")).toBe("2028-02-29");
    expect(monthFirstDay("")).toBe("");
    expect(monthLastDay("")).toBe("");
  });

  it("derives the month from an exact range only", () => {
    expect(monthFromExactRange("2026-10-01", "2026-10-31")).toBe("2026-10");
    expect(monthFromExactRange("2026-10-01", "2026-10-30")).toBe("");
    expect(monthFromExactRange("2026-09-01", "2026-10-31")).toBe("");
  });

  it("initMonth uses the given date", () => {
    expect(initMonth(new Date(2026, 8, 15))).toBe("2026-09");
  });

  it("lists months newest first with the default Vietnamese label", () => {
    const options = generateMonthOptions(2, new Date(2026, 0, 10));
    expect(options).toEqual([
      { value: "2026-01", label: "Tháng 1/2026" },
      { value: "2025-12", label: "Tháng 12/2025" },
    ]);
  });

  it("uses a custom label formatter when provided", () => {
    const options = generateMonthOptions(
      1,
      new Date(2026, 0, 10),
      (m, y) => `M${m}-${y}`,
    );
    expect(options[0].label).toBe("M1-2026");
  });
});

describe("exportPeriod date range validation", () => {
  it("flags a start date after the end date", () => {
    expect(isDateRangeInvalid("2026-10-02", "2026-10-01")).toBe(true);
  });

  it("accepts equal dates and ordered dates", () => {
    expect(isDateRangeInvalid("2026-10-01", "2026-10-01")).toBe(false);
    expect(isDateRangeInvalid("2026-10-01", "2026-10-31")).toBe(false);
  });

  it("does not flag a range with a missing side", () => {
    expect(isDateRangeInvalid("2026-10-01", "")).toBe(false);
    expect(isDateRangeInvalid(undefined, "2026-10-01")).toBe(false);
  });
});

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

describe("exportPeriod year helpers", () => {
  it("returns first and last day of a year", () => {
    expect(yearFirstDay("2026")).toBe("2026-01-01");
    expect(yearLastDay("2026")).toBe("2026-12-31");
    expect(yearFirstDay("")).toBe("");
    expect(yearLastDay("")).toBe("");
  });

  it("derives the year from an exact range only", () => {
    expect(yearFromExactRange("2026-01-01", "2026-12-31")).toBe("2026");
    expect(yearFromExactRange("2026-01-01", "2026-12-30")).toBe("");
    expect(yearFromExactRange("2025-01-01", "2026-12-31")).toBe("");
  });

  it("initYear uses the given date", () => {
    expect(initYear(new Date(2026, 5, 10))).toBe("2026");
  });

  it("lists years newest first with default Vietnamese label", () => {
    const options = generateYearOptions(2, new Date(2026, 0, 1));
    expect(options).toEqual([
      { value: "2026", label: "Năm 2026" },
      { value: "2025", label: "Năm 2025" },
      { value: "2024", label: "Năm 2024" },
    ]);
  });

  it("supports custom label formatter for year options", () => {
    const options = generateYearOptions(
      1,
      new Date(2026, 0, 1),
      (y) => `FY${y}`,
    );
    expect(options[0].label).toBe("FY2026");
  });
});
