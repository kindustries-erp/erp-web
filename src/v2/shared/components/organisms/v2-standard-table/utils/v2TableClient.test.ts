import { describe, expect, it } from "vitest";
import {
  ColumnValueType,
  TableSortState,
  V2_BLANK_VALUE,
} from "@/v2/shared/types/v2-table";
import {
  extractUniqueOptions,
  paginateClientItems,
  paginateOptions,
  sortClientItems,
} from "./v2TableClient";

interface Row {
  name: string;
  qty: number | null;
}

const rows: Row[] = [
  { name: "b-10", qty: 10 },
  { name: "b-2", qty: null },
  { name: "a-1", qty: 2 },
];

const columns = [
  {
    key: "name",
    valueType: ColumnValueType.TEXT,
    getValue: (r: Row) => r.name,
  },
  {
    key: "qty",
    valueType: ColumnValueType.NUMBER,
    getValue: (r: Row) => r.qty,
  },
];

describe("sortClientItems", () => {
  it("returns the input when there are no valid sorts", () => {
    expect(sortClientItems(rows, columns, [])).toBe(rows);
    expect(
      sortClientItems(rows, columns, [
        { columnKey: "x", direction: TableSortState.ASC },
      ]),
    ).toBe(rows);
  });

  it("sorts text naturally and does not mutate the input", () => {
    const sorted = sortClientItems(rows, columns, [
      { columnKey: "name", direction: TableSortState.ASC },
    ]);
    expect(sorted.map((r) => r.name)).toEqual(["a-1", "b-2", "b-10"]);
    expect(rows[0].name).toBe("b-10");
  });

  it("sorts numbers and keeps blanks last in both directions", () => {
    const asc = sortClientItems(rows, columns, [
      { columnKey: "qty", direction: TableSortState.ASC },
    ]);
    const desc = sortClientItems(rows, columns, [
      { columnKey: "qty", direction: TableSortState.DESC },
    ]);
    expect(asc.map((r) => r.qty)).toEqual([2, 10, null]);
    expect(desc.map((r) => r.qty)).toEqual([10, 2, null]);
  });
});

describe("paginateClientItems", () => {
  it("slices with 1-based pages", () => {
    const items = [1, 2, 3, 4, 5];
    expect(paginateClientItems(items, 1, 2)).toEqual([1, 2]);
    expect(paginateClientItems(items, 3, 2)).toEqual([5]);
  });
});

describe("extractUniqueOptions / paginateOptions", () => {
  const data = [{ v: "b" }, { v: "a" }, { v: "a" }, { v: "" }, { v: null }];
  const get = (r: { v: string | null }) => r.v;

  it("dedupes, sorts and prepends the blank option when enabled", () => {
    expect(extractUniqueOptions(data, get).map((o) => o.value)).toEqual([
      "a",
      "b",
    ]);
    expect(
      extractUniqueOptions(data, get, { showBlankOption: true }).map(
        (o) => o.value,
      ),
    ).toEqual([V2_BLANK_VALUE, "a", "b"]);
  });

  it("applies search keywords and formats labels", () => {
    const options = extractUniqueOptions(data, get, {
      search: "a",
      showBlankOption: true,
      formatOptionLabel: (v) => v.toUpperCase(),
    });
    expect(options).toEqual([{ value: "a", label: "A" }]);
  });

  it("paginates options with a next cursor", () => {
    const options = Array.from({ length: 5 }, (_, i) => ({
      value: `${i}`,
      label: `${i}`,
    }));
    expect(paginateOptions(options, 1, 2)).toMatchObject({ total: 5, next: 2 });
    expect(paginateOptions(options, 3, 2)).toMatchObject({
      items: [options[4]],
      next: null,
    });
  });
});
