import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2_BLANK_VALUE } from "@/v2/shared/types/v2-table";
import type { V2FetchOptions } from "@/v2/shared/types/v2-table";
import { useV2ColumnOptions } from "./V2StandardTable.options.hook";

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

const PAGE_1 = {
  items: [
    { value: "a", label: "A" },
    { value: V2_BLANK_VALUE, label: V2_BLANK_VALUE },
  ],
  total: 3,
  next: 2,
};
const PAGE_2 = { items: [{ value: "c", label: "C" }], total: 3, next: null };

const makeFetch = () =>
  vi.fn<V2FetchOptions>(async ({ pageParam }) =>
    pageParam === 1 ? PAGE_1 : PAGE_2,
  );

const base = { search: "", queryKeyPrefix: "test-options" };

describe("useV2ColumnOptions", () => {
  it("stays idle and does not fetch without an open column", () => {
    const fetchOptions = makeFetch();
    const { result } = renderHook(
      () => useV2ColumnOptions({ ...base, columnKey: null, fetchOptions }),
      { wrapper },
    );
    expect(result.current.status).toBe("idle");
    expect(fetchOptions).not.toHaveBeenCalled();
  });

  it("loads options for the column and prepends the blank option", async () => {
    const fetchOptions = makeFetch();
    const { result } = renderHook(
      () =>
        useV2ColumnOptions({
          ...base,
          columnKey: "code",
          fetchOptions,
          showBlankOption: true,
          filtersStr: '{"x":1}',
        }),
      { wrapper },
    );
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.options.map((o) => o.value)).toEqual([
      V2_BLANK_VALUE,
      "a",
    ]);
    expect(fetchOptions).toHaveBeenCalledWith({
      columnKey: "code",
      search: "",
      pageParam: 1,
      filtersStr: '{"x":1}',
    });
  });

  it("drops the blank option while searching or when not requested", async () => {
    const { result } = renderHook(
      () =>
        useV2ColumnOptions({
          ...base,
          columnKey: "code",
          fetchOptions: makeFetch(),
          showBlankOption: true,
          search: "a",
        }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.options.map((o) => o.value)).toEqual(["a"]);
  });

  it("appends the next page when asked to load more", async () => {
    const fetchOptions = makeFetch();
    const { result } = renderHook(
      () => useV2ColumnOptions({ ...base, columnKey: "code", fetchOptions }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    act(() => result.current.onLoadMore());
    await waitFor(() =>
      expect(result.current.options.map((o) => o.value)).toEqual(["a", "c"]),
    );
    expect(result.current.hasNextPage).toBe(false);
  });

  it("reports errors", async () => {
    const fetchOptions = vi.fn<V2FetchOptions>(async () => {
      throw new Error("boom");
    });
    const { result } = renderHook(
      () => useV2ColumnOptions({ ...base, columnKey: "code", fetchOptions }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("does not show another column's options while the next one loads", async () => {
    const slow = vi.fn<V2FetchOptions>(() => new Promise(() => undefined));
    const fast = makeFetch();
    const { result, rerender } = renderHook(
      ({ columnKey, fetchOptions }) =>
        useV2ColumnOptions({ ...base, columnKey, fetchOptions }),
      { wrapper, initialProps: { columnKey: "code", fetchOptions: fast } },
    );
    await waitFor(() => expect(result.current.status).toBe("ready"));
    rerender({ columnKey: "name", fetchOptions: slow });
    expect(result.current.options).toEqual([]);
    expect(result.current.status).toBe("loading");
  });
});
