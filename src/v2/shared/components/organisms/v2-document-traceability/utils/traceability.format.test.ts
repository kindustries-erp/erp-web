import { describe, expect, it } from "vitest";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import { formatTraceAmount, formatTraceDate } from "./traceability.format";

describe("formatTraceDate", () => {
  it("shows a date-only value as the same day in GMT+7", () => {
    expect(formatTraceDate("2026-10-26")).toBe("26/10/2026");
  });

  it("converts an ISO instant to the GMT+7 calendar day", () => {
    // 2026-10-25 18:00 UTC là 2026-10-26 01:00 ở GMT+7
    expect(formatTraceDate("2026-10-25T18:00:00Z")).toBe("26/10/2026");
  });

  it("returns a dash for empty or invalid input", () => {
    expect(formatTraceDate(null)).toBe("—");
    expect(formatTraceDate("không phải ngày")).toBe("—");
  });
});

describe("formatTraceAmount", () => {
  it("delegates to the V2 amount formatter and keeps the currency suffix", () => {
    expect(formatTraceAmount(1413720)).toBe(formatAmount(1413720));
    expect(formatTraceAmount(1413720).endsWith(" đ")).toBe(true);
  });
});
