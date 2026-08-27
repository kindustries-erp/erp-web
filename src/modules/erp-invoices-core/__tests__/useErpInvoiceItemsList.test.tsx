import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useErpInvoiceItemsList } from "../hooks/useErpInvoiceItemsList";
import {
  erpInvoicesCoreApi,
  type ErpInvoiceItemRow,
} from "../api/erpInvoicesCoreApi";

// Mock the API
vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    getItemsList: vi.fn(),
    getItemColumnOptions: vi.fn(),
    exportItemsExcel: vi.fn(),
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
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useErpInvoiceItemsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (erpInvoicesCoreApi.getItemsList as any).mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 0,
      page: 1,
      pageSize: 20,
      summary: {
        totalQuantity: 0,
        totalPreVatAmount: 0,
        totalVatAmount: 0,
        totalDiscountAmount: 0,
        totalAmount: 0,
      },
    });
  });

  it("should initialize with default pagination and sorting", async () => {
    const { result } = renderHook(
      () => useErpInvoiceItemsList({ direction: "IN" }),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current.page).toBe(1);
    expect(result.current.sorts).toEqual(["-invoiceDate"]);
    expect(result.current.activeFilterCount).toBe(0);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it("should handle column filters and reset page to 1", async () => {
    const { result } = renderHook(
      () => useErpInvoiceItemsList({ direction: "IN" }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.page).toBe(3);

    act(() => {
      result.current.setColumnFilter("invoiceNo", ["HD001", "HD002"]);
    });

    expect(result.current.page).toBe(1);
    expect(result.current.columnFilters.invoiceNo).toEqual(["HD001", "HD002"]);
    expect(result.current.activeFilterCount).toBe(2);
  });

  it("should fetch items with query params correctly", async () => {
    const mockItems: ErpInvoiceItemRow[] = [
      {
        id: "item-1",
        invoiceId: "inv-1",
        invoiceNo: "0000001",
        serialNo: "1C24TYB",
        invoiceDate: "2024-05-10",
        direction: "IN",
        status: "CONFIRMED",
        postingStatus: "POSTED",
        sellerName: "Công ty ABC",
        sellerTaxCode: "0101234567",
        itemCode: "SKU-001",
        description: "Bơm xăng",
        unit: "Cái",
        quantity: 5,
        unitPrice: 200000,
        preVatAmount: 1000000,
        vatRate: "10%",
        vatAmount: 100000,
        discountAmount: 0,
        totalAmount: 1100000,
        invoiceSubcategory: "NORMAL",
      },
    ];

    (erpInvoicesCoreApi.getItemsList as any).mockResolvedValueOnce({
      items: mockItems,
      total: 1,
      totalPages: 1,
      page: 1,
      pageSize: 20,
      summary: {
        totalQuantity: 5,
        totalPreVatAmount: 1000000,
        totalVatAmount: 100000,
        totalDiscountAmount: 0,
        totalAmount: 1100000,
      },
    });

    const { result } = renderHook(
      () => useErpInvoiceItemsList({ direction: "IN" }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].invoiceNo).toBe("0000001");
    expect(result.current.summary.totalAmount).toBe(1100000);
    expect(result.current.summary.totalQuantity).toBe(5);
  });

  it("should clear all filters properly", async () => {
    const { result } = renderHook(
      () => useErpInvoiceItemsList({ direction: "OUT" }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setSearch("Phụ tùng");
      result.current.setDateRange("2024-01-01", "2024-01-31");
      result.current.setSubcategoryFilter("DISCOUNT");
      result.current.setColumnFilter("itemCode", ["SKU-01"]);
    });

    expect(result.current.activeFilterCount).toBeGreaterThan(0);

    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.search).toBe("");
    expect(result.current.dateFrom).toBe("");
    expect(result.current.dateTo).toBe("");
    expect(result.current.subcategoryFilter).toBe("ALL");
    expect(result.current.columnFilters).toEqual({});
    expect(result.current.activeFilterCount).toBe(0);
  });
});
