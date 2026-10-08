import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCashflowTable } from "./GarageCashflowTable";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (typeof opts === "string") return opts;
      if (opts && typeof opts === "object" && opts.defaultValue)
        return opts.defaultValue;
      return key;
    },
  }),
}));

const mockItems = [
  {
    id: "cf-1",
    transDate: "2026-10-08",
    settlementType: "RECEIPT" as const,
    sourceChannel: "ON_SYSTEM" as const,
    paymentMethod: "BANK_TRANSFER" as const,
    amount: 5000000,
    partnerName: "PHẠM HÙNG",
    payerType: "KH" as const,
    caseId: "case-1",
    caseCode: "GR-PDV2610-0011",
    licensePlate: "49A43568",
    createdAt: "2026-10-08T07:00:00Z",
    updatedAt: "2026-10-08T07:00:00Z",
  },
  {
    id: "cf-2",
    transDate: "2026-10-07",
    settlementType: "PAYMENT" as const,
    sourceChannel: "OFF_SYSTEM_MANUAL" as const,
    paymentMethod: "CASH" as const,
    amount: 800000,
    partnerName: "Tiệm Tiện Đĩa",
    payerType: "SUPPLIER" as const,
    createdAt: "2026-10-07T07:00:00Z",
    updatedAt: "2026-10-07T07:00:00Z",
  },
];

vi.mock("@/modules/garage/hooks/useGarageCashflowQuery", () => ({
  useGarageCashflowList: vi.fn(() => ({
    data: {
      items: mockItems,
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
      stats: {
        totalReceipts: 5000000,
        totalPayments: 800000,
        netCashflow: 4200000,
        totalTransactions: 2,
        linkedCasesCount: 1,
      },
    },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  })),
  useDeleteGarageCashflow: vi.fn(() => ({
    mutateAsync: vi.fn(),
  })),
}));

vi.mock("@/shared/hooks/useTableColumnState", () => ({
  useTableColumnState: vi.fn(() => ({
    sorts: [],
    columnFilters: {},
    columnSearch: {},
    activeFilterCount: 0,
    setSort: vi.fn(),
    setColumnSearch: vi.fn(),
    setColumnFilter: vi.fn(),
    resetFilters: vi.fn(),
  })),
}));

describe("GarageCashflowTable Organism", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it("renders table with title, tabs and formatted row items", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowTable />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Sổ thu chi xưởng")).toBeInTheDocument();
    expect(screen.getByText("Tất cả")).toBeInTheDocument();
    expect(screen.getAllByText("Thu tiền").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Chi tiền").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("PHẠM HÙNG")).toBeInTheDocument();
    expect(screen.getByText("Tiệm Tiện Đĩa")).toBeInTheDocument();
    expect(screen.getByText("GR-PDV2610-0011")).toBeInTheDocument();
    expect(screen.getByText("+5.000.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("-800.000 ₫")).toBeInTheDocument();
  });
});
