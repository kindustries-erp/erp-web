import { describe, it, expect } from "vitest";
import { describeFilterConditions } from "../garageCaseFilterSummary";

const words = {
  columnLabel: (key: string) => `[${key}]`,
  contains: "chứa",
  statusName: (tab: string) => `tab:${tab}`,
  empty: "(trống)",
};

describe("describeFilterConditions", () => {
  it("trả mảng rỗng khi không có hoặc sai định dạng filtersStr", () => {
    expect(describeFilterConditions(undefined, words)).toEqual([]);
    expect(describeFilterConditions("", words)).toEqual([]);
    expect(describeFilterConditions("{không hợp lệ", words)).toEqual([]);
  });

  it("liệt kê từng cột lọc với giá trị đọc được", () => {
    const rows = describeFilterConditions(
      JSON.stringify({
        classification: ["OJ", "KHAC"],
        statusTab: ["completed"],
      }),
      words,
    );
    expect(rows).toEqual([
      { label: "[classification]", value: "OJ, KHAC" },
      { label: "[statusName]", value: "tab:completed" },
    ]);
  });

  it("hiển thị tìm trong cột và khoảng giá trị dạng từ → đến", () => {
    const rows = describeFilterConditions(
      JSON.stringify({
        khachHangName: ["__ALL_MATCHING__", "Nguyễn"],
        dateX: ["2026-07-01..2026-07-31"],
      }),
      words,
    );
    expect(rows[0]).toEqual({
      label: "[khachHangName]",
      value: 'chứa "Nguyễn"',
    });
    expect(rows[1].value).toBe("2026-07-01 → 2026-07-31");
  });

  it("bỏ qua cột không có giá trị", () => {
    expect(
      describeFilterConditions(JSON.stringify({ empty: [] }), words),
    ).toEqual([]);
  });
});
