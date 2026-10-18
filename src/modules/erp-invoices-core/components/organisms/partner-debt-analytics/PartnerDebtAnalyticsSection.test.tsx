import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PartnerDebtAnalyticsSection } from "./PartnerDebtAnalyticsSection";
import type { PartnerInvoiceDetailItem } from "@/modules/accounting/api/invoiceDebtsApi";

vi.mock("react-chartjs-2", () => ({
  Chart: () => <div data-testid="mock-chart" />,
  Bar: () => <div data-testid="mock-bar" />,
  Line: () => <div data-testid="mock-line" />,
  Doughnut: () => <div data-testid="mock-doughnut" />,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

const mockInvoices: PartnerInvoiceDetailItem[] = [
  {
    id: "inv-1",
    invoiceNo: "HD001",
    serialNo: "C26TAA",
    invoiceDate: "2026-01-15",
    direction: "IN",
    totalAmount: 10000000,
    paidAmount: 8000000,
    balanceAmount: 2000000,
    agingDays: 25,
    status: "APPROVED",
    preVatAmount: 9090909,
    vatAmount: 909091,
  },
  {
    id: "inv-2",
    invoiceNo: "HD002",
    serialNo: "C26TAA",
    invoiceDate: "2026-02-10",
    direction: "IN",
    totalAmount: 15000000,
    paidAmount: 5000000,
    balanceAmount: 10000000,
    agingDays: 45,
    status: "APPROVED",
    preVatAmount: 13636364,
    vatAmount: 1363636,
  },
];

describe("PartnerDebtAnalyticsSection", () => {
  it("renders all 4 chart sections for supplier correctly", () => {
    renderWithClient(
      <PartnerDebtAnalyticsSection
        invoices={mockInvoices}
        isCustomer={false}
      />,
    );

    expect(
      screen.getByText("Biến động hóa đơn theo tháng"),
    ).toBeInTheDocument();
    expect(screen.getByText("Cơ cấu phân bổ tuổi nợ")).toBeInTheDocument();
    expect(
      screen.getByText("Biểu đồ luân chuyển & Dòng tiền tích lũy"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Tỷ lệ thanh toán theo từng tháng (%)"),
    ).toBeInTheDocument();
    // Switch labels exist
    expect(screen.getByText("Biểu đồ")).toBeInTheDocument();
    expect(screen.getByText("Bảng số liệu")).toBeInTheDocument();
  });

  it("switches from chart view to table view when clicking 'Bảng số liệu'", () => {
    renderWithClient(
      <PartnerDebtAnalyticsSection
        invoices={mockInvoices}
        isCustomer={false}
      />,
    );

    fireEvent.click(screen.getByText("Bảng số liệu"));

    expect(screen.getByText("Th01/26")).toBeInTheDocument();
    expect(screen.getByText("Th02/26")).toBeInTheDocument();
  });

  it("renders customer recovery rate title when isCustomer is true", () => {
    renderWithClient(
      <PartnerDebtAnalyticsSection invoices={mockInvoices} isCustomer={true} />,
    );

    expect(
      screen.getByText("Tỷ lệ thu hồi nợ theo từng tháng (%)"),
    ).toBeInTheDocument();
  });

  it("displays fully settled state when total balance is 0", () => {
    const settledInvoices: PartnerInvoiceDetailItem[] = [
      {
        ...mockInvoices[0],
        totalAmount: 10000000,
        paidAmount: 10000000,
        balanceAmount: 0,
        agingDays: 0,
      },
    ];

    renderWithClient(
      <PartnerDebtAnalyticsSection
        invoices={settledInvoices}
        isCustomer={false}
      />,
    );

    expect(screen.getByText("Đã tất toán toàn bộ")).toBeInTheDocument();
    expect(screen.getByText("Không còn dư nợ quá hạn.")).toBeInTheDocument();
  });

  it("renders empty state fallbacks when invoices list is empty", () => {
    renderWithClient(
      <PartnerDebtAnalyticsSection invoices={[]} isCustomer={false} />,
    );

    expect(
      screen.getByText("Chưa có dữ liệu biến động dòng tiền theo tháng"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Chưa có dữ liệu dòng tiền tích lũy"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Chưa có dữ liệu tỷ lệ theo tháng"),
    ).toBeInTheDocument();
  });
});
