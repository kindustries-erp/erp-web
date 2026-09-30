import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErpInvoicePartnerTab } from "../components/organisms/erp-invoice-partner-tab";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import { invoiceDebtsApi } from "@/modules/accounting/api/invoiceDebtsApi";

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

vi.mock("@/modules/accounting/api/invoiceDebtsApi", () => ({
  invoiceDebtsApi: {
    getPartnerInvoices: vi.fn().mockResolvedValue([]),
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

  it("renders 4 subtabs: '1. Chi tiết', '2. Chi tiết theo đối tượng', '3. Chi tiết HHDV', and '4. Biến động & Phân tích'", async () => {
    renderWithClient(
      <ErpInvoicePartnerTab detailInvoice={mockInvoice as any} direction="IN">
        <div data-testid="detail-children">Nội dung chi tiết test</div>
      </ErpInvoicePartnerTab>,
    );

    expect(screen.getByText("1. Chi tiết")).toBeInTheDocument();
    expect(screen.getByText("2. Chi tiết theo đối tượng")).toBeInTheDocument();
    expect(screen.getByText("3. Chi tiết HHDV")).toBeInTheDocument();
    expect(screen.getByText("4. Biến động & Phân tích")).toBeInTheDocument();
  });

  it("defaults to '1. Chi tiết', renders children and view mode toggle buttons (Xem trước HĐ thuần / Tài liệu & PDF)", async () => {
    renderWithClient(
      <ErpInvoicePartnerTab detailInvoice={mockInvoice as any} direction="IN">
        <div data-testid="detail-children">Nội dung chi tiết test</div>
      </ErpInvoicePartnerTab>,
    );

    expect(screen.getByTestId("detail-children")).toBeInTheDocument();
    expect(screen.getByText("Xem trước HĐ thuần")).toBeInTheDocument();
    expect(screen.getByText("Tài liệu & PDF")).toBeInTheDocument();
  });

  it("switches to '2. Chi tiết theo đối tượng' when clicked and calls invoiceDebtsApi.getPartnerInvoices", async () => {
    (invoiceDebtsApi.getPartnerInvoices as any).mockResolvedValueOnce([
      {
        id: "inv-debt-1",
        invoiceNo: "0000001",
        serialNo: "1C26TGA",
        invoiceDate: "2026-03-01",
        totalAmount: 1100000,
        paidAmount: 500000,
        balanceAmount: 600000,
        agingDays: 15,
        status: "CONFIRMED",
      },
    ]);

    renderWithClient(
      <ErpInvoicePartnerTab
        detailInvoice={mockInvoice as any}
        direction="IN"
      />,
    );

    const invoicesSubTabBtn = screen.getByText("2. Chi tiết theo đối tượng");
    fireEvent.click(invoicesSubTabBtn);

    await waitFor(() => {
      expect(invoiceDebtsApi.getPartnerInvoices).toHaveBeenCalledWith(
        "0101234567",
        expect.objectContaining({
          partner_type: "SUPPLIER",
        }),
      );
      expect(screen.getByText("Đã cấn trừ")).toBeInTheDocument();
      expect(screen.getByText("Còn nợ")).toBeInTheDocument();
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

  it("switches to '4. Biến động & Phân tích' when clicked and renders analytics dashboard", async () => {
    (invoiceDebtsApi.getPartnerInvoices as any).mockResolvedValueOnce([
      {
        id: "inv-debt-1",
        invoiceNo: "0000001",
        serialNo: "1C26TGA",
        invoiceDate: "2026-03-01",
        totalAmount: 5000000,
        paidAmount: 2000000,
        balanceAmount: 3000000,
        agingDays: 20,
        status: "CONFIRMED",
      },
    ]);

    renderWithClient(
      <ErpInvoicePartnerTab
        detailInvoice={mockInvoice as any}
        direction="IN"
      />,
    );

    const analyticsSubTabBtn = screen.getByText("4. Biến động & Phân tích");
    fireEvent.click(analyticsSubTabBtn);

    await waitFor(() => {
      expect(invoiceDebtsApi.getPartnerInvoices).toHaveBeenCalledWith(
        "0101234567",
        expect.objectContaining({
          partner_type: "SUPPLIER",
        }),
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
    });
  });
});
