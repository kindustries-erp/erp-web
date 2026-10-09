import { describe, expect, it } from "vitest";
import {
  ColumnValueType,
  DateFilterOperator,
  NumberFilterOperator,
  V2_ALL_MATCHING_VALUE,
  V2_BLANK_VALUE,
} from "@/v2/shared/types/v2-table";
import { createInitialQuery } from "./v2TableQuery";
import { buildActiveFilterChips } from "./v2ActiveFilterChips";
import type { V2Column } from "./V2StandardTable.type";

const col = (
  key: string,
  label: string,
  valueType: ColumnValueType,
): V2Column<unknown> => ({
  key,
  label,
  cell: () => null,
  filter: { valueType },
});
const columns = [
  col("code", "Mã", ColumnValueType.TEXT),
  col("amount", "Tiền", ColumnValueType.NUMBER),
  col("date", "Ngày", ColumnValueType.DATE),
  { key: "plain", label: "Không lọc", cell: () => null } as V2Column<unknown>,
];
const t = (key: string, o?: Record<string, unknown>) => {
  const map: Record<string, string> = {
    "v2.table.blank": "(Trống)",
    "v2.table.valuesCount": `${o?.count} giá trị`,
    "v2.table.operators.number.gt": "Lớn hơn (>)",
  };
  return map[key] ?? key;
};

describe("buildActiveFilterChips", () => {
  it("không lọc thì không có chip", () => {
    expect(buildActiveFilterChips(createInitialQuery(), columns, t)).toEqual(
      [],
    );
  });

  it("một giá trị hiện giá trị, nhiều giá trị hiện số lượng, giữ thứ tự cột", () => {
    const q = createInitialQuery({
      columnFilters: { code: ["HD-1"], amount: ["1", "2", "3"] },
    });
    const chips = buildActiveFilterChips(q, columns, t);
    expect(chips.map((c) => [c.columnKey, c.summary])).toEqual([
      ["code", "HD-1"],
      ["amount", "3 giá trị"],
    ]);
  });

  it("__BLANK__ hiện (Trống), composite không lộ :::, chọn tất cả kết quả hiện từ khóa", () => {
    const blank = createInitialQuery({
      columnFilters: { code: [V2_BLANK_VALUE] },
    });
    expect(buildActiveFilterChips(blank, columns, t)[0].summary).toBe(
      "(Trống)",
    );
    const comp = createInitialQuery({ columnFilters: { code: ["A:::B"] } });
    expect(buildActiveFilterChips(comp, columns, t)[0].summary).not.toContain(
      ":::",
    );
    const all = createInitialQuery({
      columnFilters: { code: [V2_ALL_MATCHING_VALUE, "abc"] },
    });
    expect(buildActiveFilterChips(all, columns, t)[0].summary).toBe('"abc"');
  });

  it("gộp tìm kiếm, toán tử và khoảng ngày vào cùng chip của cột", () => {
    const q = createInitialQuery({
      columnSearch: { code: " abc " },
      columnOperators: {
        amount: { operator: NumberFilterOperator.GREATER_THAN, value: "100" },
      },
      dateRanges: { date: { from: "2026-10-01", to: "2026-10-07" } },
    });
    const chips = buildActiveFilterChips(q, columns, t);
    expect(chips.find((c) => c.columnKey === "code")?.summary).toBe('"abc"');
    expect(chips.find((c) => c.columnKey === "amount")?.summary).toBe(
      "Lớn hơn (>) 100",
    );
    expect(chips.find((c) => c.columnKey === "date")?.summary).toBe(
      "01/10/2026 – 07/10/2026",
    );
  });

  it("khoảng ngày thiếu một đầu và cột không có filter spec", () => {
    const q = createInitialQuery({
      dateRanges: { date: { from: "2026-10-01" } },
      columnFilters: { plain: ["x"] },
      columnOperators: {
        date: { operator: DateFilterOperator.AFTER, value: "2026-01-01" },
      },
    });
    const chips = buildActiveFilterChips(q, columns, t);
    expect(chips.map((c) => c.columnKey)).toEqual(["date"]);
    expect(chips[0].summary).toContain("01/10/2026 – …");
  });
});
