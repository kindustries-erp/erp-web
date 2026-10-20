import { describe, expect, it } from "vitest";
import {
  ColumnValueType,
  NumberFilterOperator,
  V2_ALL_MATCHING_VALUE,
  V2_BLANK_VALUE,
} from "@/v2/shared/types/v2-table";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import {
  filterClientItems,
  matchesKeywords,
  parseKeywords,
} from "./v2TableFilter";

interface Row {
  code: string;
  qty: number | null;
  day: string;
}

const rows: Row[] = [
  { code: "HD-01", qty: 5, day: "2026-01-10T08:00:00Z" },
  { code: "HD-02", qty: 20, day: "2026-02-15" },
  { code: "HD-03", qty: null, day: "" },
  { code: "", qty: 100, day: "2026-03-01" },
];

const columns = [
  {
    key: "code",
    valueType: ColumnValueType.TEXT,
    getValue: (r: Row) => r.code,
  },
  {
    key: "qty",
    valueType: ColumnValueType.NUMBER,
    getValue: (r: Row) => r.qty,
  },
  { key: "day", valueType: ColumnValueType.DATE, getValue: (r: Row) => r.day },
];

const emptyQuery: Pick<
  V2TableQuery,
  "columnFilters" | "columnSearch" | "columnOperators" | "dateRanges"
> = {
  columnFilters: {},
  columnSearch: {},
  columnOperators: {},
  dateRanges: {},
};

describe("parseKeywords / matchesKeywords", () => {
  it("splits by ; and detects exact quoted keywords", () => {
    expect(parseKeywords('"HD-01";HD-02; ;HD-03')).toEqual([
      { text: "hd-01", exact: true },
      { text: "hd-02", exact: false },
      { text: "hd-03", exact: false },
    ]);
  });

  it("ignores empty quotes and blank input", () => {
    expect(parseKeywords('""')).toEqual([]);
    expect(parseKeywords("  ")).toEqual([]);
  });

  it("matches exact vs partial with OR semantics", () => {
    const keywords = parseKeywords('"HD-01";xyz');
    expect(matchesKeywords("HD-01", keywords)).toBe(true);
    expect(matchesKeywords("HD-011", keywords)).toBe(false);
    expect(matchesKeywords("abc xyz", keywords)).toBe(true);
  });

  it("matches everything when there are no keywords", () => {
    expect(matchesKeywords("anything", [])).toBe(true);
  });
});

describe("filterClientItems", () => {
  const filter = (patch: Partial<typeof emptyQuery>) =>
    filterClientItems(rows, columns, { ...emptyQuery, ...patch }).map(
      (r) => r.code,
    );

  it("returns the same array reference when nothing is active", () => {
    expect(filterClientItems(rows, columns, emptyQuery)).toBe(rows);
  });

  it("filters by selected values and the blank option", () => {
    expect(filter({ columnFilters: { code: ["HD-01", "HD-02"] } })).toEqual([
      "HD-01",
      "HD-02",
    ]);
    expect(filter({ columnFilters: { code: [V2_BLANK_VALUE] } })).toEqual([""]);
  });

  it("supports __ALL_MATCHING__ with the search keyword", () => {
    expect(
      filter({ columnFilters: { code: [V2_ALL_MATCHING_VALUE, "HD-0"] } }),
    ).toEqual(["HD-01", "HD-02", "HD-03"]);
  });

  it("combines column search, operators and date ranges with AND", () => {
    const result = filter({
      columnSearch: { code: "HD" },
      columnOperators: {
        qty: { operator: NumberFilterOperator.GREATER_THAN, value: "4" },
      },
      dateRanges: { day: { from: "2026-01-01", to: "2026-01-31" } },
    });
    expect(result).toEqual(["HD-01"]);
  });
});
