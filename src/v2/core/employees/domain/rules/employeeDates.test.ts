import { describe, expect, it } from "vitest";
import {
  formatVnDate,
  isoToVnDate,
  todayVnDate,
  vnDateToIso,
} from "./employeeDates";

describe("employeeDates", () => {
  it("ngày thuần giờ VN đi về không lệch (ca biên 1990-05-01)", () => {
    const iso = vnDateToIso("1990-05-01");
    expect(iso).toBe("1990-04-30T17:00:00.000Z");
    expect(isoToVnDate(iso)).toBe("1990-05-01");
  });

  it("chuỗi rỗng hoặc sai định dạng cho kết quả rỗng/null", () => {
    expect(vnDateToIso("")).toBeNull();
    expect(vnDateToIso("01/05/1990")).toBeNull();
    expect(isoToVnDate(null)).toBe("");
    expect(isoToVnDate("không-phải-ngày")).toBe("");
  });

  it("định dạng dd/MM/yyyy và dấu gạch khi trống", () => {
    expect(formatVnDate("1990-04-30T17:00:00.000Z")).toBe("01/05/1990");
    expect(formatVnDate(undefined)).toBe("—");
  });

  it("today theo giờ VN: 18:00 UTC đã sang ngày hôm sau", () => {
    expect(todayVnDate(new Date("2026-11-15T18:00:00Z"))).toBe("2026-11-16");
  });
});
