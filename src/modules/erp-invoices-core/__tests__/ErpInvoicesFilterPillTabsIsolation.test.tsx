import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useErpInvoicesTabLogic } from "../components/ErpInvoicesTab/useErpInvoicesTabLogic";
import { useErpInvoiceListStore } from "../hooks/useErpInvoiceListStore";
import { useErpInvoiceItemsStore } from "../hooks/useErpInvoiceItemsStore";

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
    getItemsList: vi.fn().mockResolvedValue({
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

describe("ErpInvoicesFilterPillTabsIsolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/erp-invoices");
    useErpInvoiceListStore.getState().resetAllFilters("IN");
    useErpInvoiceListStore.getState().resetAllFilters("OUT");
    useErpInvoiceItemsStore.getState().resetAllFilters("IN");
    useErpInvoiceItemsStore.getState().resetAllFilters("OUT");
  });

  it("maintains separate activeTaxTab between Header IN and Header OUT", () => {
    const { result, rerender } = renderHook(() => useErpInvoicesTabLogic({}), {
      wrapper: createWrapper(),
    });

    // On Header IN (default), set tax_tab to replacement
    act(() => {
      useErpInvoiceListStore.getState().setActiveTaxTab("IN", "replacement");
    });
    rerender();

    expect(useErpInvoiceListStore.getState().states["IN"].activeTaxTab).toBe(
      "replacement",
    );
    expect(useErpInvoiceListStore.getState().states["OUT"].activeTaxTab).toBe(
      "all",
    );

    // Switch to Header OUT
    act(() => {
      result.current.handleTabChange("out");
    });
    rerender();

    expect(result.current.currentTabKey).toBe("out");
    expect(result.current.direction).toBe("OUT");
    expect(useErpInvoiceListStore.getState().states["OUT"].activeTaxTab).toBe(
      "all",
    );
    expect(window.location.search).not.toContain("tax_tab=replacement");
  });

  it("maintains separate subcategoryFilter between Lines IN and Lines OUT", () => {
    const { result, rerender } = renderHook(() => useErpInvoicesTabLogic({}), {
      wrapper: createWrapper(),
    });

    // Switch to Lines IN
    act(() => {
      result.current.handleTabChange("in-lines");
      useErpInvoiceItemsStore.getState().setSubcategoryFilter("IN", "DISCOUNT");
    });
    rerender();

    expect(
      useErpInvoiceItemsStore.getState().states["IN"].subcategoryFilter,
    ).toBe("DISCOUNT");
    expect(
      useErpInvoiceItemsStore.getState().states["OUT"].subcategoryFilter,
    ).toBe("ALL");

    // Switch to Lines OUT
    act(() => {
      result.current.handleTabChange("out-lines");
    });
    rerender();

    expect(result.current.currentTabKey).toBe("out-lines");
    expect(
      useErpInvoiceItemsStore.getState().states["OUT"].subcategoryFilter,
    ).toBe("ALL");
    expect(window.location.search).not.toContain("subcat=DISCOUNT");
  });

  it("does not leak search or date filters from Header to Lines or OUT", () => {
    const { result, rerender } = renderHook(() => useErpInvoicesTabLogic({}), {
      wrapper: createWrapper(),
    });

    // Set filter on Header IN
    act(() => {
      useErpInvoiceListStore.getState().setSearch("IN", "Cong Ty ABC");
      useErpInvoiceListStore.getState().setDateFrom("IN", "2026-01-01");
    });
    rerender();

    // Switch to Header OUT
    act(() => {
      result.current.handleTabChange("out");
    });
    rerender();

    // Header OUT store should be clean
    expect(useErpInvoiceListStore.getState().states["OUT"].search).toBe("");
    expect(useErpInvoiceListStore.getState().states["OUT"].dateFrom).toBe("");
    expect(window.location.search).not.toContain("search=Cong+Ty+ABC");
    expect(window.location.search).not.toContain("dateFrom=2026-01-01");

    // Switch to Lines IN
    act(() => {
      result.current.handleTabChange("in-lines");
    });
    rerender();

    // Lines IN store should be clean
    expect(useErpInvoiceItemsStore.getState().states["IN"].search).toBe("");
    expect(useErpInvoiceItemsStore.getState().states["IN"].dateFrom).toBe("");
    expect(window.location.search).not.toContain("search=Cong+Ty+ABC");
  });

  it("maintains separate view_mode preset between Header IN and Header OUT", () => {
    const { result, rerender } = renderHook(() => useErpInvoicesTabLogic({}), {
      wrapper: createWrapper(),
    });

    // Change view_mode on IN to 'audit'
    act(() => {
      result.current.handleColumnPresetChange({
        key: "audit",
        label: "Kiểm toán / Đối soát",
        filters: {},
        columnFilters: {},
        columnVisibility: {},
        isCustom: false,
      });
    });
    rerender();

    expect(result.current.activeColumnPresetKey).toBe("audit");
    expect(window.location.search).toContain("view_mode=audit");

    // Switch to Header OUT
    act(() => {
      result.current.handleTabChange("out");
    });
    rerender();

    // OUT should still have default 'overview'
    expect(result.current.currentTabKey).toBe("out");
    expect(result.current.direction).toBe("OUT");
    expect(result.current.activeColumnPresetKey).toBe("overview");
    expect(window.location.search).not.toContain("view_mode=audit");

    // Switch back to Header IN
    act(() => {
      result.current.handleTabChange("in");
    });
    rerender();

    // IN should restore 'audit'
    expect(result.current.currentTabKey).toBe("in");
    expect(result.current.direction).toBe("IN");
    expect(result.current.activeColumnPresetKey).toBe("audit");
    expect(window.location.search).toContain("view_mode=audit");
  });
});
