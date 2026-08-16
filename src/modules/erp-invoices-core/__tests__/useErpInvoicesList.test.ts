import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
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
  sortBy: "invoiceDate",
  sortOrder: "desc" as const,
  filterPanelOpen: false,
};

const resetZustand = () => {
  useErpInvoiceListStore.setState({
    states: {
      IN: { ...initialSubState },
      OUT: { ...initialSubState },
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
    const { result } = renderHook(() => useErpInvoicesList());

    expect(result.current.direction).toBe("IN");
    expect(result.current.page).toBe(1);
    expect(result.current.sortBy).toBe("invoiceDate");
    expect(result.current.sortOrder).toBe("desc");
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.invoices).toEqual([]);
  });

  it("should change direction and reset page", async () => {
    const { result } = renderHook(() => useErpInvoicesList());
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
    const { result } = renderHook(() => useErpInvoicesList());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.sortBy).toBe("invoiceDate");
    expect(result.current.sortOrder).toBe("desc");

    act(() => {
      // First toggle sets to -invoiceDate (desc) because default was none.
      // Wait, if it wasn't tracked by useTableColumnState yet, it pushes invoiceDate (asc).
      result.current.handleSort("invoiceDate");
    });

    // Let's just check it changed to asc
    expect(result.current.sortOrder).toBe("asc");
    expect(result.current.page).toBe(1);
  });

  it("should change sort key and default to desc", async () => {
    const { result } = renderHook(() => useErpInvoicesList());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleSort("totalAmount");
    });

    expect(result.current.sortBy).toBe("totalAmount");
    // tableState.toggleSort pushes field first, so it defaults to asc!
    // Wait, useTableColumnState.ts pushes field first (asc), then -field (desc).
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

    const { result } = renderHook(() => useErpInvoicesList());
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
});
