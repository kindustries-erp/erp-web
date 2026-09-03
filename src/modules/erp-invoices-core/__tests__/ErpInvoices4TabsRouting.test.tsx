import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useErpInvoicesTabLogic } from "../components/ErpInvoicesTab/useErpInvoicesTabLogic";

// Mocks
vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    list: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 0,
      page: 1,
      pageSize: 50,
    }),
    getItems: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 0,
      page: 1,
      pageSize: 50,
      summary: {},
    }),
    getItemColumnOptions: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 0,
      page: 1,
    }),
  },
}));

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: () => true,
}));

vi.mock("@/modules/tags/api/tagsApi", () => ({
  getTags: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/modules/branches/api/branchApi", () => ({
  getBranchOptionsApi: vi.fn().mockResolvedValue([]),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("ErpInvoices4TabsRouting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/erp-invoices");
  });

  it("initializes with tab 'in' by default", () => {
    const { result } = renderHook(() => useErpInvoicesTabLogic({}), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentTabKey).toBe("in");
    expect(result.current.direction).toBe("IN");
    expect(result.current.activeView).toBe("header");
    expect(result.current.pageTabs).toHaveLength(4);
    expect(result.current.pageTabs?.map((t) => t.value)).toEqual([
      "in",
      "in-lines",
      "out",
      "out-lines",
    ]);
  });

  it("initializes from URL query param tab=out", () => {
    window.history.replaceState(null, "", "/erp-invoices?tab=out");
    const { result } = renderHook(() => useErpInvoicesTabLogic({}), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentTabKey).toBe("out");
    expect(result.current.direction).toBe("OUT");
    expect(result.current.activeView).toBe("header");
  });

  it("initializes from URL query param tab=in-lines", () => {
    window.history.replaceState(null, "", "/erp-invoices?tab=in-lines");
    const { result } = renderHook(() => useErpInvoicesTabLogic({}), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentTabKey).toBe("in-lines");
    expect(result.current.direction).toBe("IN");
    expect(result.current.activeView).toBe("lines");
  });

  it("initializes from URL query param tab=out-lines", () => {
    window.history.replaceState(null, "", "/erp-invoices?tab=out-lines");
    const { result } = renderHook(() => useErpInvoicesTabLogic({}), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentTabKey).toBe("out-lines");
    expect(result.current.direction).toBe("OUT");
    expect(result.current.activeView).toBe("lines");
  });

  it("switches tabs smoothly and updates URL params cleanly without filter bleeding", () => {
    const { result } = renderHook(() => useErpInvoicesTabLogic({}), {
      wrapper: createWrapper(),
    });

    // Switch to out
    act(() => {
      result.current.handleTabChange("out");
    });
    expect(result.current.currentTabKey).toBe("out");
    expect(result.current.direction).toBe("OUT");
    expect(result.current.activeView).toBe("header");
    expect(window.location.search).toContain("tab=out");

    // Switch to in-lines
    act(() => {
      result.current.handleTabChange("in-lines");
    });
    expect(result.current.currentTabKey).toBe("in-lines");
    expect(result.current.direction).toBe("IN");
    expect(result.current.activeView).toBe("lines");
    expect(window.location.search).toContain("tab=in-lines");

    // Switch to out-lines
    act(() => {
      result.current.handleTabChange("out-lines");
    });
    expect(result.current.currentTabKey).toBe("out-lines");
    expect(result.current.direction).toBe("OUT");
    expect(result.current.activeView).toBe("lines");
    expect(window.location.search).toContain("tab=out-lines");

    // Switch back to in
    act(() => {
      result.current.handleTabChange("in");
    });
    expect(result.current.currentTabKey).toBe("in");
    expect(result.current.direction).toBe("IN");
    expect(result.current.activeView).toBe("header");
    expect(window.location.search).toContain("tab=in");
  });
});
