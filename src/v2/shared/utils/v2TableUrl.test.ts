import { describe, expect, it } from "vitest";
import { TableSortState } from "@/v2/shared/types/v2-table";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import { getDefaultPageSize } from "./v2TableFormat";
import {
  clearV2TablePrefix,
  resetV2TableUrl,
  parseV2TableQuery,
  writeV2TableQuery,
} from "./v2TableUrl";

const emptyQuery = (): V2TableQuery => ({
  page: 1,
  pageSize: getDefaultPageSize(),
  sorts: [],
  columnFilters: {},
  columnSearch: {},
  columnOperators: {},
  dateRanges: {},
});

describe("writeV2TableQuery", () => {
  it("writes nothing for a default query", () => {
    const params = new URLSearchParams();
    writeV2TableQuery(params, emptyQuery());
    expect(params.toString()).toBe("");
  });

  it("writes page, sort and search", () => {
    const params = new URLSearchParams();
    writeV2TableQuery(params, {
      ...emptyQuery(),
      page: 3,
      sorts: [{ columnKey: "total", direction: TableSortState.DESC }],
      search: "hd",
    });
    expect(params.get("page")).toBe("3");
    expect(params.get("sort")).toBe("-total");
    expect(params.get("q")).toBe("hd");
  });

  it("removes keys that return to the default", () => {
    const params = new URLSearchParams("page=3&q=hd");
    writeV2TableQuery(params, emptyQuery());
    expect(params.toString()).toBe("");
  });

  it("namespaces keys with a prefix and leaves other keys alone", () => {
    const params = new URLSearchParams("tab=in&other=1");
    writeV2TableQuery(params, { ...emptyQuery(), page: 2 }, "in");
    expect(params.get("in.page")).toBe("2");
    expect(params.get("other")).toBe("1");
  });
});

describe("parseV2TableQuery", () => {
  it("round-trips a full query", () => {
    const query: V2TableQuery = {
      page: 4,
      pageSize: 50,
      sorts: [
        { columnKey: "date", direction: TableSortState.ASC },
        { columnKey: "total", direction: TableSortState.DESC },
      ],
      columnFilters: { status: ["NEW", "DONE"] },
      columnSearch: { name: "alpha" },
      columnOperators: { qty: { operator: "gt" as never, value: "5" } },
      dateRanges: { date: { from: "2026-01-01", to: "2026-01-31" } },
      search: "abc",
    };
    const params = new URLSearchParams();
    writeV2TableQuery(params, query, "list");
    expect(parseV2TableQuery(params, "list")).toEqual(query);
  });

  it("ignores broken values", () => {
    const params = new URLSearchParams({
      page: "abc",
      size: "-5",
      cf: "{not json",
      cs: JSON.stringify({ ok: "x", bad: 5 }),
      co: JSON.stringify({ a: { operator: 1 } }),
    });
    expect(parseV2TableQuery(params)).toEqual({ columnSearch: { ok: "x" } });
  });

  it("only reads keys of its own prefix", () => {
    const params = new URLSearchParams("in.page=2&out.page=5");
    expect(parseV2TableQuery(params, "in").page).toBe(2);
    expect(parseV2TableQuery(params, "out").page).toBe(5);
    expect(parseV2TableQuery(params).page).toBeUndefined();
  });
});

describe("clearV2TablePrefix", () => {
  it("removes only keys owned by the prefix", () => {
    const params = new URLSearchParams("tab=in&in.page=2&in.q=a&out.page=3");
    clearV2TablePrefix(params, "in");
    expect(params.toString()).toBe("tab=in&out.page=3");
  });
});

describe("resetV2TableUrl", () => {
  it("clears the prefix on the current URL and keeps other params", () => {
    window.history.replaceState(null, "", "/v2/x?tab=in&in.page=3&out.page=2");
    resetV2TableUrl("in");
    expect(window.location.search).toBe("?tab=in&out.page=2");
  });
});
