import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useErpInvoicesList } from "../hooks/useErpInvoicesList";
import { erpInvoicesCoreApi, type ErpInvoice } from "../api/erpInvoicesCoreApi";
import { useErpInvoiceListStore } from "../hooks/useErpInvoiceListStore";
import { useTableColumnStore } from "@/shared/hooks/useTableColumnState";

// Mock the API
vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    list: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const initialSubState = {
  searchInput: "",
  search: "",
  page: 1,
  pageSize: 50,
  period: "",
  dateFrom: "",
  dateTo: "",
  status: "",
  seller_name: "",
  buyer_name: "",
  tag_id: "",
  activeTaxTab: "all",
  sortBy: "invoiceDate",
  sortOrder: "desc" as const,
  filterPanelOpen: false,
};

const resetZustand = () => {
  useErpInvoiceListStore.setState({
    states: {
      IN: { ...initialSubState },
      OUT: { ...initialSubState },
      IN_2: { ...initialSubState },
      OUT_2: { ...initialSubState },
      CHECKPOINT_IN: { ...initialSubState },
      CHECKPOINT_OUT: { ...initialSubState },
    },
  });
  useTableColumnStore.setState({ tables: {} });
};

describe("useErpInvoicesList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetZustand();

    (erpInvoicesCoreApi.list as any).mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 0,
      page: 1,
      pageSize: 50,
    });
  });

  it("should initialize with default state", async () => {
    const { result } = renderHook(() => useErpInvoicesList(), {
      wrapper: createWrapper(),
    });

    expect(result.current.direction).toBe("IN");
    expect(result.current.page).toBe(1);
    expect(result.current.sortBy).toBe("invoiceDate");
    expect(result.current.sortOrder).toBe("desc");
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.invoices).toEqual([]);
  });

  it("should change direction and reset page", async () => {
    const { result } = renderHook(() => useErpInvoicesList(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.page).toBe(2);

    act(() => {
      result.current.setDirection("OUT");
    });

    expect(result.current.direction).toBe("OUT");
    expect(result.current.page).toBe(1); // Page should reset
  });

  it("should toggle sort order when sorting by same key", async () => {
    const { result } = renderHook(() => useErpInvoicesList(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.sortBy).toBe("invoiceDate");
    expect(result.current.sortOrder).toBe("desc");

    act(() => {
      result.current.handleSort("invoiceDate");
    });

    expect(result.current.sortOrder).toBe("asc");
    expect(result.current.page).toBe(1);
  });

  it("should change sort key and default to desc", async () => {
    const { result } = renderHook(() => useErpInvoicesList(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleSort("totalAmount");
    });

    expect(result.current.sortBy).toBe("totalAmount");
    expect(result.current.sortOrder).toBe("asc");
  });

  it("should fetch invoices correctly", async () => {
    const mockList = erpInvoicesCoreApi.list as any;
    mockList.mockResolvedValueOnce({
      items: [{ id: "1", invoiceNo: "INV-01" } as unknown as ErpInvoice],
      total: 1,
      totalPages: 1,
      page: 1,
      pageSize: 50,
    });

    const { result } = renderHook(() => useErpInvoicesList(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: "IN",
        page: 1,
        pageSize: 50,
        sort_by: "invoiceDate",
        sort_order: "desc",
      }),
    );

    expect(result.current.invoices).toHaveLength(1);
    expect(result.current.total).toBe(1);
  });

  describe("GDT status (taxInvoiceStatus) filtering", () => {
    it("should send taxInvoiceStatus when user sets column filter on tab 'all'", async () => {
      const mockList = erpInvoicesCoreApi.list as any;
      const { result } = renderHook(() => useErpInvoicesList(), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.tableState.setColumnFilter("taxInvoiceStatus", ["1"]);
      });

      await waitFor(() => {
        const lastCall = mockList.mock.calls[mockList.mock.calls.length - 1][0];
        const colFilters = JSON.parse(lastCall.column_filters);
        expect(colFilters.taxInvoiceStatus).toEqual(["1"]);
      });
    });

    it("should omit taxInvoiceStatus on tab 'all' when column filter is empty", async () => {
      const mockList = erpInvoicesCoreApi.list as any;
      const { result } = renderHook(() => useErpInvoicesList(), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.loading).toBe(false));

      const lastCall = mockList.mock.calls[mockList.mock.calls.length - 1][0];
      const colFilters = JSON.parse(lastCall.column_filters);
      expect(colFilters.taxInvoiceStatus).toBeUndefined();
    });

    it("should fallback to tab statuses on tab 'replacement' when column filter is empty", async () => {
      const mockList = erpInvoicesCoreApi.list as any;
      const { result } = renderHook(() => useErpInvoicesList(), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.setActiveTaxTab("replacement");
      });

      await waitFor(() => {
        const lastCall = mockList.mock.calls[mockList.mock.calls.length - 1][0];
        const colFilters = JSON.parse(lastCall.column_filters);
        expect(colFilters.taxInvoiceStatus).toEqual(["2", "4"]);
      });
    });

    it("should prioritize user column filter over tab default on tab 'replacement'", async () => {
      const mockList = erpInvoicesCoreApi.list as any;
      const { result } = renderHook(() => useErpInvoicesList(), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.setActiveTaxTab("replacement");
        result.current.tableState.setColumnFilter("taxInvoiceStatus", ["2"]);
      });

      await waitFor(() => {
        const lastCall = mockList.mock.calls[mockList.mock.calls.length - 1][0];
        const colFilters = JSON.parse(lastCall.column_filters);
        expect(colFilters.taxInvoiceStatus).toEqual(["2"]);
      });
    });
  });
});
