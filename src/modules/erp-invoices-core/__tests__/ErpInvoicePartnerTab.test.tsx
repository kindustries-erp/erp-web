import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErpInvoicePartnerTab } from "../components/ErpInvoicePartnerTab";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import { erpInvoiceDashboardApi } from "../api/erpInvoiceDashboardApi";

// Mocks
vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    list: vi.fn().mockResolvedValue({
      items: [
        {
          id: "inv-1",
          invoiceNo: "0000001",
          serialNo: "1C26TGA",
          invoiceDate: "2026-03-01",
          preVatAmount: 1000000,
          vatAmount: 100000,
          totalAmount: 1100000,
          status: "CONFIRMED",
        },
      ],
      total: 1,
      totalPages: 1,
      page: 1,
      pageSize: 50,
    }),
    getItemsList: vi.fn().mockResolvedValue({
      items: [
        {
          id: "item-1",
          invoiceId: "inv-1",
          invoiceNo: "0000001",
          serialNo: "1C26TGA",
          invoiceDate: "2026-03-01",
          description: "Lốp xe Michelin",
          quantity: 4,
          unitPrice: 250000,
          preVatAmount: 1000000,
          vatAmount: 100000,
          totalAmount: 1100000,
        },
      ],
      total: 1,
      totalPages: 1,
      page: 1,
      pageSize: 50,
      summary: {
        totalQuantity: 4,
        totalPreVatAmount: 1000000,
        totalVatAmount: 100000,
        totalAmount: 1100000,
      },
    }),
    getInvoiceColumnOptions: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      totalPages: 1,
    }),
  },
}));

vi.mock("../api/erpInvoiceDashboardApi", () => ({
  erpInvoiceDashboardApi: {
    getPartnerStats: vi.fn().mockResolvedValue({
      cashTrend: [],
    }),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { language: "vi" },
  }),
}));

const mockInvoice = {
  id: "inv-main",
  invoiceNo: "0000099",
  serialNo: "1C26TGA",
  sellerName: "Công ty TNHH Phụ Tùng Ô Tô",
  sellerTaxCode: "0101234567",
  direction: "IN" as const,
  totalAmount: 1100000,
  preVatAmount: 1000000,
  vatAmount: 100000,
};

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

describe("ErpInvoicePartnerTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 5 subtabs: '1. Chi tiết', '2. Danh sách hóa đơn', '3. Chi tiết HHDV', '4. Biến động', and '5. Tài liệu đính kèm'", async () => {
    renderWithClient(
      <ErpInvoicePartnerTab detailInvoice={mockInvoice as any} direction="IN">
        <div data-testid="detail-children">Nội dung chi tiết test</div>
      </ErpInvoicePartnerTab>,
    );

    expect(screen.getByText("1. Chi tiết")).toBeInTheDocument();
    expect(screen.getByText("2. Danh sách hóa đơn")).toBeInTheDocument();
    expect(screen.getByText("3. Chi tiết HHDV")).toBeInTheDocument();
    expect(screen.getByText("4. Biến động")).toBeInTheDocument();
    expect(screen.getByText("5. Tài liệu đính kèm")).toBeInTheDocument();
  });

  it("defaults to '1. Chi tiết', renders children and view mode toggle buttons (Xem trước HĐ thuần / File PDF)", async () => {
    renderWithClient(
      <ErpInvoicePartnerTab detailInvoice={mockInvoice as any} direction="IN">
        <div data-testid="detail-children">Nội dung chi tiết test</div>
      </ErpInvoicePartnerTab>,
    );

    expect(screen.getByTestId("detail-children")).toBeInTheDocument();
    expect(screen.getByText("Xem trước HĐ thuần")).toBeInTheDocument();
    expect(screen.getByText("File PDF")).toBeInTheDocument();
  });

  it("switches to '2. Danh sách hóa đơn' when clicked and calls erpInvoicesCoreApi.list", async () => {
    renderWithClient(
      <ErpInvoicePartnerTab
        detailInvoice={mockInvoice as any}
        direction="IN"
      />,
    );

    const invoicesSubTabBtn = screen.getByText("2. Danh sách hóa đơn");
    fireEvent.click(invoicesSubTabBtn);

    await waitFor(() => {
      expect(erpInvoicesCoreApi.list).toHaveBeenCalledWith(
        expect.objectContaining({
          partner_tax_code: "0101234567",
        }),
      );
    });
  });

  it("switches to '3. Chi tiết HHDV' when clicked and calls getItemsList", async () => {
    renderWithClient(
      <ErpInvoicePartnerTab
        detailInvoice={mockInvoice as any}
        direction="IN"
      />,
    );

    const itemsSubTabBtn = screen.getByText("3. Chi tiết HHDV");
    fireEvent.click(itemsSubTabBtn);

    await waitFor(() => {
      expect(erpInvoicesCoreApi.getItemsList).toHaveBeenCalledWith(
        expect.objectContaining({
          partner_tax_code: "0101234567",
          direction: "IN",
        }),
      );
    });
  });

  it("switches to '4. Biến động' when clicked and renders analytics dashboard", async () => {
    (erpInvoiceDashboardApi.getPartnerStats as any).mockResolvedValueOnce({
      cashTrend: [
        { label: "2026-01", cashIn: 5000000, cashOut: 2000000 },
        { label: "2026-02", cashIn: 8000000, cashOut: 3000000 },
      ],
    });

    renderWithClient(
      <ErpInvoicePartnerTab
        detailInvoice={mockInvoice as any}
        direction="IN"
      />,
    );

    const analyticsSubTabBtn = screen.getByText("4. Biến động");
    fireEvent.click(analyticsSubTabBtn);

    await waitFor(() => {
      expect(erpInvoiceDashboardApi.getPartnerStats).toHaveBeenCalledWith(
        "0101234567",
      );
      expect(
        screen.getByText("Biểu đồ biến động theo tháng"),
      ).toBeInTheDocument();
      expect(screen.getByText("Bảng kê biến động theo kỳ")).toBeInTheDocument();
    });
  });
});
