import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import { getDefaultPageSize } from "@/v2/shared/utils/v2TableFormat";
import { updateV2SearchParams } from "@/v2/shared/utils/v2Url";
import { useV2SearchParams } from "./useV2SearchParams";
import { useV2TableUrlState } from "./useV2TableUrlState";

const base = (): V2TableQuery => ({
  page: 1,
  pageSize: getDefaultPageSize(),
  sorts: [],
  columnFilters: {},
  columnSearch: {},
  columnOperators: {},
  dateRanges: {},
});

describe("useV2TableUrlState", () => {
  beforeEach(() => window.history.replaceState(null, "", "/v2/list"));

  it("starts from the base query when the URL is empty", () => {
    const { result } = renderHook(() => useV2TableUrlState({ base: base() }));
    expect(result.current.query).toEqual(base());
  });

  it("restores the query from the URL on mount", () => {
    window.history.replaceState(null, "", "/v2/list?page=3&q=abc");
    const { result } = renderHook(() => useV2TableUrlState({ base: base() }));
    expect(result.current.initialQuery.page).toBe(3);
    expect(result.current.initialQuery.search).toBe("abc");
  });

  it("writes changes to the URL without touching other params", () => {
    window.history.replaceState(null, "", "/v2/list?tab=in");
    const { result } = renderHook(() =>
      useV2TableUrlState({ base: base(), prefix: "in" }),
    );
    act(() => result.current.setQuery({ ...base(), page: 2, search: "hd" }));
    expect(result.current.query.page).toBe(2);
    expect(window.location.search).toContain("tab=in");
    expect(window.location.search).toContain("in.page=2");
    expect(window.location.search).toContain("in.q=hd");
  });

  it("two prefixes keep independent state", () => {
    window.history.replaceState(null, "", "/v2/list?in.page=2&out.page=5");
    const inTab = renderHook(() =>
      useV2TableUrlState({ base: base(), prefix: "in" }),
    );
    const outTab = renderHook(() =>
      useV2TableUrlState({ base: base(), prefix: "out" }),
    );
    expect(inTab.result.current.query.page).toBe(2);
    expect(outTab.result.current.query.page).toBe(5);
  });
});

describe("useV2SearchParams", () => {
  beforeEach(() => window.history.replaceState(null, "", "/v2/list?a=1"));

  it("reflects the current query string and follows updates", () => {
    const { result } = renderHook(() => useV2SearchParams());
    expect(result.current.get("a")).toBe("1");
    act(() => updateV2SearchParams((p) => p.set("a", "2")));
    expect(result.current.get("a")).toBe("2");
  });
});
