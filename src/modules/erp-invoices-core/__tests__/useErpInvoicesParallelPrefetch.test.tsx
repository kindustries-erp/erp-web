import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useErpInvoicesParallelPrefetch } from "../hooks/useErpInvoicesParallelPrefetch";

vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    list: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 0,
      page: 1,
      pageSize: 50,
    }),
    getItemsList: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 0,
      page: 1,
      pageSize: 50,
      summary: {},
    }),
  },
}));

describe("useErpInvoicesParallelPrefetch", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it("prefetches all other 3 tabs in parallel after 50ms delay", async () => {
    const prefetchSpy = vi.spyOn(queryClient, "prefetchQuery");

    renderHook(
      () =>
        useErpInvoicesParallelPrefetch({
          activeTabKey: "in",
          instanceIndex: 1,
          delayMs: 50,
        }),
      { wrapper: createWrapper() },
    );

    // Before timer fires
    expect(prefetchSpy).not.toHaveBeenCalled();

    // Fast-forward 50ms
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Should prefetch in-lines, out, and out-lines
    expect(prefetchSpy).toHaveBeenCalledTimes(3);
  });

  it("does not prefetch if isDrawer is true", () => {
    const prefetchSpy = vi.spyOn(queryClient, "prefetchQuery");

    renderHook(
      () =>
        useErpInvoicesParallelPrefetch({
          activeTabKey: "in",
          isDrawer: true,
        }),
      { wrapper: createWrapper() },
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(prefetchSpy).not.toHaveBeenCalled();
  });

  it("cleans up timer on unmount before delay", () => {
    const prefetchSpy = vi.spyOn(queryClient, "prefetchQuery");

    const { unmount } = renderHook(
      () =>
        useErpInvoicesParallelPrefetch({
          activeTabKey: "in",
          delayMs: 50,
        }),
      { wrapper: createWrapper() },
    );

    // Unmount before 50ms
    unmount();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(prefetchSpy).not.toHaveBeenCalled();
  });
});
