import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useErpInvoicesList } from "../hooks/useErpInvoicesList";
import { erpInvoicesCoreApi, type ErpInvoice } from "../api/erpInvoicesCoreApi";

// Mock the API
vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    list: vi.fn(),
  },
}));

// Mock the filter panel hook since we just want to test invoice list logic
vi.mock("@/shared/hooks/useFilterPanel", () => ({
  useFilterPanel: (config: unknown, onChange: () => void) => ({
    state: { search: "", dateFrom: null, dateTo: null, status: null },
    activeFilterCount: 0,
    togglePanel: vi.fn(),
    // mock just enough to trigger onChange if needed
    _triggerChange: onChange,
  }),
}));

describe("useErpInvoicesList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useErpInvoicesList());

    expect(result.current.direction).toBe("IN");
    expect(result.current.page).toBe(1);
    expect(result.current.sortBy).toBe("invoiceDate");
    expect(result.current.sortOrder).toBe("desc");
    expect(result.current.loading).toBe(false);
    expect(result.current.invoices).toEqual([]);
  });

  it("should change direction and reset page", () => {
    const { result } = renderHook(() => useErpInvoicesList());

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

  it("should toggle sort order when sorting by same key", () => {
    const { result } = renderHook(() => useErpInvoicesList());

    expect(result.current.sortBy).toBe("invoiceDate");
    expect(result.current.sortOrder).toBe("desc");

    act(() => {
      result.current.handleSort("invoiceDate");
    });

    expect(result.current.sortOrder).toBe("asc"); // toggled
    expect(result.current.page).toBe(1);
  });

  it("should change sort key and default to desc", () => {
    const { result } = renderHook(() => useErpInvoicesList());

    act(() => {
      result.current.handleSort("totalAmount");
    });

    expect(result.current.sortBy).toBe("totalAmount");
    expect(result.current.sortOrder).toBe("desc"); // new key defaults to desc
  });

  it("should fetch invoices correctly", async () => {
    const mockList = vi.mocked(erpInvoicesCoreApi.list);
    mockList.mockResolvedValueOnce({
      items: [{ id: "1", invoiceNo: "INV-01" } as unknown as ErpInvoice],
      total: 1,
      totalPages: 1,
      page: 1,
      pageSize: 40,
    });

    const { result } = renderHook(() => useErpInvoicesList());

    await act(async () => {
      await result.current.loadInvoices();
    });

    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: "IN",
        page: 1,
        pageSize: 40,
        sort_by: "invoiceDate",
        sort_order: "desc",
      }),
    );

    expect(result.current.invoices).toHaveLength(1);
    expect(result.current.total).toBe(1);
  });
});
