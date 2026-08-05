import { describe, expect, it } from "vitest";

import { periodFromExactRange } from "@/modules/finance/utils/financeHelpers";

describe("periodFromExactRange", () => {
  it("returns yyyy-MM when range matches exact month boundaries", () => {
    expect(periodFromExactRange("2026-07-01", "2026-07-31")).toBe("2026-07");
    expect(periodFromExactRange("2026-02-01", "2026-02-28")).toBe("2026-02");
  });

  it("returns empty string when range spans multiple months", () => {
    expect(periodFromExactRange("2026-07-01", "2026-08-01")).toBe("");
  });

  it("returns empty string when from-date is not first day", () => {
    expect(periodFromExactRange("2026-07-02", "2026-07-31")).toBe("");
  });

  it("returns empty string when to-date is not last day", () => {
    expect(periodFromExactRange("2026-07-01", "2026-07-30")).toBe("");
  });

  it("returns empty string when input is missing", () => {
    expect(periodFromExactRange(undefined, "2026-07-31")).toBe("");
    expect(periodFromExactRange("2026-07-01", undefined)).toBe("");
    expect(periodFromExactRange(undefined, undefined)).toBe("");
  });
});
