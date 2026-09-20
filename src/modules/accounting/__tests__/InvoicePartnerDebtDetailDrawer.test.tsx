import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InvoicePartnerDebtDetailDrawer } from "../components/InvoicePartnerDebtDetailDrawer";
import { invoiceDebtsApi } from "../api/invoiceDebtsApi";

// Mocks
vi.mock("../api/invoiceDebtsApi", () => ({
  invoiceDebtsApi: {
    getPartnerInvoices: vi.fn().mockResolvedValue([
      {
        id: "inv-1",
        invoiceNo: "HD0001",
        serialNo: "1C26TGA",
        invoiceDate: "2026-03-01",
        preVatAmount: 1000000,
        vatAmount: 100000,
        totalAmount: 1100000,
        paidAmount: 500000,
        balanceAmount: 600000,
        agingDays: 15,
        status: "CONFIRMED",
        buyerName: "Khách hàng Test",
      },
    ]),
    getPartnerStats: vi.fn().mockResolvedValue({
      cashTrend: [{ label: "01/2026", cashIn: 1100000, cashOut: 0 }],
    }),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { language: "vi" },
  }),
}));

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

describe("InvoicePartnerDebtDetailDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders PillTabs with '1. Danh sách hóa đơn' and '2. Biến động & Phân tích' inside Left Panel", async () => {
    renderWithClient(
      <InvoicePartnerDebtDetailDrawer
        open={true}
        onClose={vi.fn()}
        taxCode="0312345678"
        partnerName="Công ty Khách Hàng ABC"
        partnerType="CUSTOMER"
      />,
    );

    // Verify sub-tabs render in left panel
    expect(screen.getByText("1. Danh sách hóa đơn")).toBeInTheDocument();
    expect(screen.getByText("2. Biến động & Phân tích")).toBeInTheDocument();
  });

  it("defaults to '1. Danh sách hóa đơn' and fetches partner invoices", async () => {
    renderWithClient(
      <InvoicePartnerDebtDetailDrawer
        open={true}
        onClose={vi.fn()}
        taxCode="0312345678"
        partnerName="Công ty Khách Hàng ABC"
        partnerType="CUSTOMER"
      />,
    );

    await waitFor(() => {
      expect(invoiceDebtsApi.getPartnerInvoices).toHaveBeenCalledWith(
        "0312345678",
        expect.objectContaining({
          partner_type: "CUSTOMER",
        }),
      );
    });
  });

  it("switches to '2. Biến động & Phân tích' when clicked and displays analytics sections", async () => {
    renderWithClient(
      <InvoicePartnerDebtDetailDrawer
        open={true}
        onClose={vi.fn()}
        taxCode="0312345678"
        partnerName="Công ty Khách Hàng ABC"
        partnerType="CUSTOMER"
      />,
    );

    const analyticsTabBtn = screen.getByText("2. Biến động & Phân tích");
    fireEvent.click(analyticsTabBtn);

    expect(
      screen.getByText("Biến động hóa đơn theo tháng"),
    ).toBeInTheDocument();
    expect(screen.getByText("Cơ cấu phân bổ tuổi nợ")).toBeInTheDocument();
  });
});
