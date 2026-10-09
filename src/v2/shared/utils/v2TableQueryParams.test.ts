import { describe, expect, it } from "vitest";
import { TableSortState } from "@/v2/shared/types/v2-table";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import {
  getV2ColumnFilterValues,
  getV2DateRange,
  getV2PrimarySort,
  toV2DayBounds,
  toV2OffsetPage,
} from "./v2TableQueryParams";

const query = (patch: Partial<V2TableQuery> = {}): V2TableQuery => ({
  page: 1,
  pageSize: 20,
  sorts: [],
  columnFilters: {},
  columnSearch: {},
  columnOperators: {},
  dateRanges: {},
  ...patch,
});

describe("v2TableQueryParams", () => {
  it("returns no primary sort when unsorted", () => {
    expect(getV2PrimarySort(query())).toBeUndefined();
  });

  it("maps the first sort to field and order", () => {
    expect(
      getV2PrimarySort(
        query({
          sorts: [
            { columnKey: "total", direction: TableSortState.DESC },
            { columnKey: "date", direction: TableSortState.ASC },
          ],
        }),
      ),
    ).toEqual({ field: "total", order: "desc" });
  });

  it("reads column filter values with an empty default", () => {
    const q = query({ columnFilters: { status: ["NEW"] } });
    expect(getV2ColumnFilterValues(q, "status")).toEqual(["NEW"]);
    expect(getV2ColumnFilterValues(q, "other")).toEqual([]);
  });

  it("reads a date range with an empty default", () => {
    const q = query({ dateRanges: { date: { from: "2026-01-01" } } });
    expect(getV2DateRange(q, "date")).toEqual({ from: "2026-01-01" });
    expect(getV2DateRange(q, "other")).toEqual({});
  });

  it("converts a date range to day bounds", () => {
    expect(toV2DayBounds({ from: "2026-01-01", to: "2026-01-31" })).toEqual({
      from: "2026-01-01T00:00:00",
      to: "2026-01-31T23:59:59",
    });
    expect(toV2DayBounds({})).toEqual({ from: undefined, to: undefined });
  });

  it("converts a page to limit and offset", () => {
    expect(toV2OffsetPage(query({ page: 3, pageSize: 50 }))).toEqual({
      limit: 50,
      offset: 100,
    });
  });
});
