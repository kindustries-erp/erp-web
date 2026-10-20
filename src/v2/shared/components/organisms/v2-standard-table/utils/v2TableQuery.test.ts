import { describe, expect, it } from "vitest";
import {
  countActiveFilters,
  createInitialQuery,
  withValue,
} from "./v2TableQuery";

describe("createInitialQuery", () => {
  it("builds defaults without a default sort", () => {
    const query = createInitialQuery({ pageSize: 50 });
    expect(query).toMatchObject({ page: 1, pageSize: 50, sorts: [] });
  });

  it("falls back to a supported page size", () => {
    expect([20, 50]).toContain(createInitialQuery({ pageSize: 7 }).pageSize);
  });
});

describe("countActiveFilters", () => {
  it("counts a column once even with several filter kinds", () => {
    const query = createInitialQuery({
      pageSize: 20,
      columnFilters: { a: ["x"] },
      columnSearch: { a: "x" },
    });
    expect(countActiveFilters(query)).toBe(1);
  });

  it("ignores empty arrays, blank search and empty date ranges", () => {
    const query = createInitialQuery({
      pageSize: 20,
      columnFilters: { a: [] },
      columnSearch: { b: "  " },
      dateRanges: { c: {} },
    });
    expect(countActiveFilters(query)).toBe(0);
  });
});

describe("withValue", () => {
  it("sets, replaces and removes a key immutably", () => {
    const original = { a: 1 };
    expect(withValue(original, "b", 2)).toEqual({ a: 1, b: 2 });
    expect(withValue(original, "a", null)).toEqual({});
    expect(original).toEqual({ a: 1 });
  });
});
