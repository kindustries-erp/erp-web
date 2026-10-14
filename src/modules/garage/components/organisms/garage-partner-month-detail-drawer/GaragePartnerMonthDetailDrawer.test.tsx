import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GaragePartnerMonthDetailDrawer } from "./GaragePartnerMonthDetailDrawer";

vi.mock("./GaragePartnerMonthDetailDrawer.hook", () => ({
  useGaragePartnerMonthDetailDrawerLogic: (props: any) => ({
    debtType: props.initialDebtType || "receivables",
    handleDebtTypeChange: vi.fn(),
    activeSubTab: "cases",
    setActiveSubTab: vi.fn(),
    monthKey: "2026-10",
    monthLabel: "Tháng 10/2026",
    dateFrom: "2026-10-01",
    dateTo: "2026-10-31",
    tableHook: {
      columnSearch: {},
      columnFilters: {},
      sorts: [],
      activeFilterCount: 0,
      setColumnSearch: vi.fn(),
      setColumnFilter: vi.fn(),
      setSort: vi.fn(),
      resetFilters: vi.fn(),
    },
    monthCases: [
      {
        id: "case-1",
        soChungTu: "GR-PDV2610-0001",
        bienSoXe: "51K12345",
        ngayHoanThanhCongViec: "2026-10-05",
        classification: "SUA_CHUA_CHUNG",
        doanhThu: 5000000,
        thueVat: 500000,
        tienCoThue: 5500000,
        daThanhToan: 2000000,
      },
    ],
    filteredCases: [
      {
        id: "case-1",
        soChungTu: "GR-PDV2610-0001",
        bienSoXe: "51K12345",
        ngayHoanThanhCongViec: "2026-10-05",
        classification: "SUA_CHUA_CHUNG",
        doanhThu: 5000000,
        thueVat: 500000,
        tienCoThue: 5500000,
        daThanhToan: 2000000,
      },
    ],
    metrics: {
      totalBilled: 5500000,
      totalPaid: 2000000,
      totalRemaining: 3500000,
      rate: 36.4,
      caseCount: 1,
      revenue: 5000000,
      vatAmount: 500000,
      customer: {
        billed: 5500000,
        paid: 2000000,
        remaining: 3500000,
        rate: 36.4,
        caseCount: 1,
        withInvoiceAmount: 0,
        noInvoiceAmount: 5500000,
        vatWithoutInvoiceAmount: 500000,
      },
      insurance: {
        billed: 0,
        paid: 0,
        remaining: 0,
        rate: 0,
        caseCount: 0,
        withInvoiceAmount: 0,
        noInvoiceAmount: 0,
        vatWithoutInvoiceAmount: 0,
      },
      vatWarning: {
        hasWarning: true,
        totalVatWithoutInvoice: 500000,
        casesCount: 1,
      },
    },
    classificationRows: [
      {
        key: "SUA_CHUA_CHUNG",
        name: "Sửa chữa chung",
        caseCount: 1,
        billed: 5500000,
        paid: 2000000,
        remaining: 3500000,
        remainingWithInvoice: 0,
        remainingNoInvoice: 3500000,
        rate: 36.4,
        shareRate: 100,
      },
    ],
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

describe("GaragePartnerMonthDetailDrawer", () => {
  it("renders partner month detail drawer when open", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <GaragePartnerMonthDetailDrawer
          open={true}
          month="2026-10"
          customerCode="CUST-001"
          customerName="CÔNG TY TNHH ABC"
          taxCode="0312345678"
          onClose={vi.fn()}
        />
      </QueryClientProvider>,
    );

    // Checks header content
    expect(screen.getByText(/Tháng 10\/2026/)).toBeDefined();
    expect(screen.getByText(/CÔNG TY TNHH ABC/)).toBeDefined();
    expect(screen.getByText("CUST-001")).toBeDefined();

    // Checks KPI Card
    expect(screen.getAllByText(/Khách Hàng/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bảo Hiểm/i).length).toBeGreaterThan(0);

    // Checks table tab
    expect(screen.getByText("GR-PDV2610-0001")).toBeDefined();
    expect(screen.getByText("51K12345")).toBeDefined();
  });
});
