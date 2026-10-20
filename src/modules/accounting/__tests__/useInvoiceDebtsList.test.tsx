import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useInvoiceDebtsList } from "../hooks/useInvoiceDebtsList";

// Mocks
vi.mock("../api/invoiceDebtsApi", () => ({
  invoiceDebtsApi: {
    getDebts: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 0,
      summary: {
        totalPartners: 0,
        totalInvoiceCount: 0,
        grandTotalAmount: 0,
        grandTotalPaid: 0,
        grandTotalBalance: 0,
      },
    }),
    getColumnOptions: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      next: null,
    }),
  },
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

describe("useInvoiceDebtsList - Tab Filter Isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default tab states for customers and suppliers", () => {
    const { result } = renderHook(() => useInvoiceDebtsList("customers"), {
      wrapper: createWrapper(),
    });

    expect(result.current.page).toBe(1);
    expect(result.current.search).toBe("");
    expect(result.current.columnFilters).toEqual({});
    expect(result.current.columnSearch).toEqual({});
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.partnerType).toBe("CUSTOMER");
  });

  it("allows setting filters and search on customers tab without affecting suppliers tab", () => {
    const { result, rerender } = renderHook(
      ({ tab }: { tab: "customers" | "suppliers" }) => useInvoiceDebtsList(tab),
      {
        wrapper: createWrapper(),
        initialProps: { tab: "customers" },
      },
    );

    // 1. Thao tác trên tab Customers
    act(() => {
      result.current.setColumnFilter("partnerName", ["Khách hàng ABC"]);
      result.current.setSearch("Từ khóa test");
      result.current.setPage(3);
    });

    expect(result.current.columnFilters).toEqual({
      partnerName: ["Khách hàng ABC"],
    });
    expect(result.current.search).toBe("Từ khóa test");
    expect(result.current.page).toBe(3);
    expect(result.current.activeFilterCount).toBe(2);

    // 2. Chuyển sang tab Suppliers
    rerender({ tab: "suppliers" });

    expect(result.current.partnerType).toBe("SUPPLIER");
    expect(result.current.columnFilters).toEqual({});
    expect(result.current.search).toBe("");
    expect(result.current.page).toBe(1);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it("preserves previous filters when switching between tabs", () => {
    const { result, rerender } = renderHook(
      ({ tab }: { tab: "customers" | "suppliers" }) => useInvoiceDebtsList(tab),
      {
        wrapper: createWrapper(),
        initialProps: { tab: "customers" },
      },
    );

    // 1. Đặt filter cho Customers
    act(() => {
      result.current.setColumnFilter("partnerName", ["Khách hàng VIP"]);
      result.current.setPage(2);
    });

    // 2. Chuyển sang Suppliers và đặt filter cho Suppliers
    rerender({ tab: "suppliers" });

    act(() => {
      result.current.setColumnFilter("taxCode", ["0101234567"]);
      result.current.setSearch("Nhà cung cấp XYZ");
      result.current.setPage(4);
    });

    expect(result.current.columnFilters).toEqual({
      taxCode: ["0101234567"],
    });
    expect(result.current.search).toBe("Nhà cung cấp XYZ");
    expect(result.current.page).toBe(4);

    // 3. Chuyển ngược lại Customers - xác nhận state của Customers còn nguyên vẹn
    rerender({ tab: "customers" });

    expect(result.current.partnerType).toBe("CUSTOMER");
    expect(result.current.columnFilters).toEqual({
      partnerName: ["Khách hàng VIP"],
    });
    expect(result.current.search).toBe("");
    expect(result.current.page).toBe(2);

    // 4. Chuyển lại Suppliers - xác nhận state của Suppliers còn nguyên vẹn
    rerender({ tab: "suppliers" });

    expect(result.current.partnerType).toBe("SUPPLIER");
    expect(result.current.columnFilters).toEqual({
      taxCode: ["0101234567"],
    });
    expect(result.current.search).toBe("Nhà cung cấp XYZ");
    expect(result.current.page).toBe(4);
  });

  it("clearAllFilters only resets the active tab without affecting the other tab", () => {
    const { result, rerender } = renderHook(
      ({ tab }: { tab: "customers" | "suppliers" }) => useInvoiceDebtsList(tab),
      {
        wrapper: createWrapper(),
        initialProps: { tab: "customers" },
      },
    );

    // 1. Đặt filter cho Customers
    act(() => {
      result.current.setColumnFilter("partnerName", ["Khách hàng 1"]);
      result.current.setSearch("Tìm kiếm KH");
    });

    // 2. Chuyển sang Suppliers và đặt filter
    rerender({ tab: "suppliers" });

    act(() => {
      result.current.setColumnFilter("partnerName", ["NCC 1"]);
      result.current.setSearch("Tìm kiếm NCC");
    });

    // 3. Xóa bộ lọc trên tab Suppliers
    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.columnFilters).toEqual({});
    expect(result.current.search).toBe("");
    expect(result.current.activeFilterCount).toBe(0);

    // 4. Chuyển về Customers - bộ lọc của Customers vẫn được giữ nguyên
    rerender({ tab: "customers" });

    expect(result.current.columnFilters).toEqual({
      partnerName: ["Khách hàng 1"],
    });
    expect(result.current.search).toBe("Tìm kiếm KH");
    expect(result.current.activeFilterCount).toBe(2);
  });
});
