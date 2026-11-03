import { describe, expect, it } from "vitest";
import {
  GDT_QUERY_WINDOW_DAYS,
  countInclusiveDays,
  estimateWindowCount,
} from "./InvoiceSyncDrawer.helper";

describe("InvoiceSyncDrawer.helper", () => {
  it("dùng cửa sổ 9 ngày khớp với API", () => {
    expect(GDT_QUERY_WINDOW_DAYS).toBe(9);
  });

  it("đếm ngày hai đầu bao gồm", () => {
    expect(countInclusiveDays("2026-10-01", "2026-10-01")).toBe(1);
    expect(countInclusiveDays("2026-10-01", "2026-10-09")).toBe(9);
    expect(countInclusiveDays("2026-10-01", "2026-10-10")).toBe(10);
  });

  it("trả về 0 khi ngày không hợp lệ hoặc from sau to", () => {
    expect(countInclusiveDays("2026-10-10", "2026-10-01")).toBe(0);
    expect(countInclusiveDays("", "2026-10-01")).toBe(0);
    expect(countInclusiveDays("01/10/2026", "10/10/2026")).toBe(0);
  });

  it.each([
    [1, 1],
    [9, 1],
    [10, 2],
    [31, 4],
    [90, 10],
  ])("%i ngày cho ước tính %i lượt quét", (days, expected) => {
    const from = "2026-01-01";
    const to = new Date(Date.UTC(2026, 0, days)).toISOString().slice(0, 10);
    expect(estimateWindowCount(from, to)).toBe(expected);
  });

  it("trả về 0 khi khoảng không hợp lệ", () => {
    expect(estimateWindowCount("2026-10-10", "2026-10-01")).toBe(0);
  });
});
