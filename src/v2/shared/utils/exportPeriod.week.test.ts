import { describe, expect, it } from "vitest";
import {
  generateWeekOptions,
  initWeek,
  weekFirstDay,
  weekFromExactRange,
  weekLastDay,
  weekValue,
} from "./exportPeriod";

describe("tuần ISO trong exportPeriod (v2)", () => {
  it("tính khóa tuần và khoảng ngày khớp với V1", () => {
    expect(weekValue(new Date(2026, 9, 14))).toBe("2026-W42");
    expect(weekFirstDay("2026-W42")).toBe("2026-10-12");
    expect(weekLastDay("2026-W42")).toBe("2026-10-18");
  });

  it("xử lý tuần giao năm: 01/01/2027 thuộc tuần 53 của 2026", () => {
    expect(weekValue(new Date(2027, 0, 1))).toBe("2026-W53");
    expect(weekFirstDay("2026-W53")).toBe("2026-12-28");
    expect(weekLastDay("2026-W53")).toBe("2027-01-03");
  });

  it("tuần 01 có thể bắt đầu từ tháng 12 năm trước", () => {
    expect(weekFirstDay("2026-W01")).toBe("2025-12-29");
  });

  it("trả về rỗng khi sai định dạng hoặc số tuần ngoài 1–53", () => {
    expect(weekFirstDay("2026-42")).toBe("");
    expect(weekFirstDay("2026-W00")).toBe("");
    expect(weekLastDay("2026-W54")).toBe("");
  });

  it("suy ra tuần từ khoảng ngày đúng một tuần", () => {
    expect(weekFromExactRange("2026-10-12", "2026-10-18")).toBe("2026-W42");
    expect(weekFromExactRange("2026-10-12", "2026-10-31")).toBe("");
    expect(weekFromExactRange("2026-10-13", "2026-10-19")).toBe("");
    expect(weekFromExactRange(undefined, "2026-10-18")).toBe("");
  });

  it("initWeek trả về tuần của ngày truyền vào", () => {
    expect(initWeek(new Date(2026, 9, 14))).toBe("2026-W42");
  });

  it("generateWeekOptions tạo các tuần liên tiếp, mới nhất trước", () => {
    const options = generateWeekOptions(3, new Date(2026, 9, 14));
    expect(options.map((o) => o.value)).toEqual([
      "2026-W42",
      "2026-W41",
      "2026-W40",
    ]);
    expect(options[0].label).toBe("Tuần 42/2026 (12/10 - 18/10)");
  });
});
