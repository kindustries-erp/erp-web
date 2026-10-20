import { describe, expect, it } from "vitest";

import {
  buildMonthOptions,
  buildPeriodOptions,
  buildQuarterOptions,
  buildWeekOptions,
  defaultPeriodValue,
  detectPeriod,
  monthRange,
  periodRange,
  quarterRange,
  toIsoDate,
  weekRange,
  weekValue,
} from "../exportPeriod";

describe("toIsoDate", () => {
  it("dùng giờ địa phương, không lệch ngày", () => {
    expect(toIsoDate(new Date(2026, 0, 1, 0, 30))).toBe("2026-01-01");
    expect(toIsoDate(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31");
  });
});

describe("weekValue / weekRange (tuần ISO, thứ Hai - Chủ nhật)", () => {
  it.each([
    [new Date(2026, 9, 12), "2026-W42"], // thứ Hai 12/10/2026
    [new Date(2026, 9, 18), "2026-W42"], // Chủ nhật cùng tuần
    [new Date(2026, 0, 1), "2026-W01"],
    [new Date(2025, 11, 29), "2026-W01"], // tuần vắt năm
    [new Date(2027, 0, 1), "2026-W53"], // thuộc năm ISO 2026
  ])("%s → %s", (date, value) => {
    expect(weekValue(date as Date)).toBe(value);
  });

  it("weekRange trả đúng thứ Hai - Chủ nhật", () => {
    expect(weekRange("2026-W42")).toEqual({
      from: "2026-10-12",
      to: "2026-10-18",
    });
    expect(weekRange("2026-W01")).toEqual({
      from: "2025-12-29",
      to: "2026-01-04",
    });
    expect(weekRange("2026-W53")).toEqual({
      from: "2026-12-28",
      to: "2027-01-03",
    });
  });

  it("weekRange chặn giá trị sai", () => {
    expect(weekRange("2026-W00")).toBeNull();
    expect(weekRange("2026-W54")).toBeNull();
    expect(weekRange("abc")).toBeNull();
  });

  it("weekValue và weekRange nhất quán với mọi ngày trong năm", () => {
    for (
      let d = new Date(2026, 0, 1);
      d.getFullYear() === 2026;
      d.setDate(d.getDate() + 1)
    ) {
      const range = weekRange(weekValue(d))!;
      const iso = toIsoDate(d);
      expect(range.from <= iso && iso <= range.to).toBe(true);
    }
  });
});

describe("monthRange / quarterRange", () => {
  it("tháng 2 năm nhuận và không nhuận", () => {
    expect(monthRange("2028-02")).toEqual({
      from: "2028-02-01",
      to: "2028-02-29",
    });
    expect(monthRange("2026-02")).toEqual({
      from: "2026-02-01",
      to: "2026-02-28",
    });
    expect(monthRange("2026-12")).toEqual({
      from: "2026-12-01",
      to: "2026-12-31",
    });
    expect(monthRange("2026-13")).toBeNull();
  });

  it("4 quý của một năm", () => {
    expect(quarterRange("2026-Q1")).toEqual({
      from: "2026-01-01",
      to: "2026-03-31",
    });
    expect(quarterRange("2026-Q2")).toEqual({
      from: "2026-04-01",
      to: "2026-06-30",
    });
    expect(quarterRange("2026-Q3")).toEqual({
      from: "2026-07-01",
      to: "2026-09-30",
    });
    expect(quarterRange("2026-Q4")).toEqual({
      from: "2026-10-01",
      to: "2026-12-31",
    });
    expect(quarterRange("2026-Q5")).toBeNull();
  });

  it("periodRange điều phối theo đơn vị; custom không có khoảng cố định", () => {
    expect(periodRange("month", "2026-07")).toEqual({
      from: "2026-07-01",
      to: "2026-07-31",
    });
    expect(periodRange("quarter", "2026-Q3")?.to).toBe("2026-09-30");
    expect(periodRange("week", "2026-W42")?.from).toBe("2026-10-12");
    expect(periodRange("custom", "x")).toBeNull();
  });
});

describe("defaultPeriodValue", () => {
  const today = new Date(2026, 9, 16); // 16/10/2026
  it("kỳ chứa ngày hiện tại", () => {
    expect(defaultPeriodValue("week", today)).toBe("2026-W42");
    expect(defaultPeriodValue("month", today)).toBe("2026-10");
    expect(defaultPeriodValue("quarter", today)).toBe("2026-Q4");
    expect(defaultPeriodValue("custom", today)).toBe("");
  });
});

describe("danh sách lựa chọn", () => {
  const today = new Date(2026, 9, 16);

  it("12 tuần gần nhất, mới nhất trước, nhãn có khoảng ngày", () => {
    const options = buildWeekOptions(12, today);
    expect(options).toHaveLength(12);
    expect(options[0]).toEqual({
      value: "2026-W42",
      label: "Tuần 42/2026 (12/10 - 18/10)",
    });
    expect(options[1].value).toBe("2026-W41");
    expect(new Set(options.map((o) => o.value)).size).toBe(12);
  });

  it("tuần lùi qua năm mới vẫn liên tục", () => {
    const options = buildWeekOptions(4, new Date(2026, 0, 8));
    expect(options.map((o) => o.value)).toEqual([
      "2026-W02",
      "2026-W01",
      "2025-W52",
      "2025-W51",
    ]);
  });

  it("24 tháng, mới nhất trước", () => {
    const options = buildMonthOptions(24, today);
    expect(options).toHaveLength(24);
    expect(options[0]).toEqual({ value: "2026-10", label: "Tháng 10/2026" });
    expect(options[23].value).toBe("2024-11");
  });

  it("quý từ quý hiện tại lùi 3 năm", () => {
    const options = buildQuarterOptions(3, today);
    expect(options[0].value).toBe("2026-Q4");
    expect(options[0].label).toBe("Quý 4/2026 (01/10 - 31/12)");
    expect(options[options.length - 1].value).toBe("2023-Q1");
    expect(options).toHaveLength(4 + 4 * 3);
  });

  it("buildPeriodOptions: custom không có lựa chọn", () => {
    expect(buildPeriodOptions("custom", today)).toEqual([]);
    expect(buildPeriodOptions("week", today)).toHaveLength(12);
  });
});

describe("detectPeriod", () => {
  it("nhận diện đúng một tháng, quý, tuần", () => {
    expect(detectPeriod("2026-07-01", "2026-07-31")).toEqual({
      unit: "month",
      value: "2026-07",
    });
    expect(detectPeriod("2026-07-01", "2026-09-30")).toEqual({
      unit: "quarter",
      value: "2026-Q3",
    });
    expect(detectPeriod("2026-10-12", "2026-10-18")).toEqual({
      unit: "week",
      value: "2026-W42",
    });
  });

  it("khoảng bất kỳ hoặc thiếu ngày là custom", () => {
    expect(detectPeriod("2026-07-02", "2026-07-31").unit).toBe("custom");
    expect(detectPeriod("2026-07-01", undefined).unit).toBe("custom");
    expect(detectPeriod("", "").unit).toBe("custom");
  });
});
