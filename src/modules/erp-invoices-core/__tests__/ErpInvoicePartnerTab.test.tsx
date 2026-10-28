import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ErpInvoicePartnerTab,
  ErpInvoicePartnerSection,
} from "../components/organisms/erp-invoice-partner-tab";
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

describe("ErpInvoicePartnerTab (main tab Chi tiết)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("không còn pill Tài chính; chỉ có toggle Xem trước / Tài liệu & PDF", () => {
    renderWithClient(
      <ErpInvoicePartnerTab detailInvoice={mockInvoice as any} direction="IN">
        <div data-testid="detail-children">Nội dung chi tiết test</div>
      </ErpInvoicePartnerTab>,
    );

    expect(screen.queryByText("Tài chính")).not.toBeInTheDocument();
    expect(screen.getByText("Xem trước HĐ thuần")).toBeInTheDocument();
    expect(screen.getByText("Tài liệu & PDF")).toBeInTheDocument();
  });

  it("renders children của HĐ", () => {
    renderWithClient(
      <ErpInvoicePartnerTab detailInvoice={mockInvoice as any} direction="IN">
        <div data-testid="detail-children">Nội dung chi tiết test</div>
      </ErpInvoicePartnerTab>,
    );

    expect(screen.getByTestId("detail-children")).toBeInTheDocument();
  });

  it("still renders children even when invoice has NO partner info (khách lẻ / no tax code)", () => {
    const anonymousInvoice = {
      id: "inv-anon-1",
      invoiceNo: "1208",
      serialNo: "C26TGA",
      direction: "OUT",
      buyerName: "",
      buyerTaxCode: "",
      buyerPersonalName: "",
      buyerCccd: "",
      sellerName: "GREENWAY",
      sellerTaxCode: "0318334886-003",
    };

    renderWithClient(
      <ErpInvoicePartnerTab
        detailInvoice={anonymousInvoice as any}
        direction="OUT"
      >
        <div data-testid="anon-invoice-details">
          Nội dung hóa đơn 1208 khách lẻ
        </div>
      </ErpInvoicePartnerTab>,
    );

    expect(screen.getByTestId("anon-invoice-details")).toBeInTheDocument();
  });

  it("renders 3 sub-pills: Chi tiết hóa đơn | Hạch toán kế toán | Chứng từ liên kết", () => {
    renderWithClient(
      <ErpInvoicePartnerTab detailInvoice={mockInvoice as any} direction="IN">
        <div data-testid="detail-children">Nội dung chi tiết test</div>
      </ErpInvoicePartnerTab>,
    );

    expect(screen.getByText("Chi tiết hóa đơn")).toBeInTheDocument();
    expect(screen.getByText("Hạch toán kế toán")).toBeInTheDocument();
    expect(screen.getByText("Chứng từ liên kết")).toBeInTheDocument();
  });

  it("renders linkedDocsSlot khi activeSubTab='linked_docs'", () => {
    renderWithClient(
      <ErpInvoicePartnerTab
        detailInvoice={mockInvoice as any}
        direction="IN"
        activeSubTab="linked_docs"
        linkedDocsSlot={
          <div data-testid="linked-docs-content">
            Nội dung chứng từ liên kết test
          </div>
        }
      >
        <div data-testid="detail-children">Nội dung chi tiết test</div>
      </ErpInvoicePartnerTab>,
    );

    expect(screen.getByTestId("linked-docs-content")).toBeInTheDocument();
  });
});

describe("ErpInvoicePartnerSection (main tab Chi tiết theo NCC/KH)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 3 sub-pills: Chi tiết theo đối tượng | Bảng kê HHDV | Biến động & Phân tích", () => {
    renderWithClient(
      <ErpInvoicePartnerSection
        detailInvoice={mockInvoice as any}
        direction="IN"
      />,
    );

    expect(screen.getByText("Chi tiết theo đối tượng")).toBeInTheDocument();
    expect(screen.getByText("Bảng kê HHDV")).toBeInTheDocument();
    expect(screen.getByText("Biến động & Phân tích")).toBeInTheDocument();
  });

  it("switches to 'Chi tiết theo đối tượng' and calls invoiceDebtsApi.getPartnerInvoices", async () => {
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
      <ErpInvoicePartnerSection
        detailInvoice={mockInvoice as any}
        direction="IN"
        defaultPartnerSubTab="invoices"
      />,
    );

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

  it("switches to 'Bảng kê HHDV' when clicked and calls getItemsList", async () => {
    renderWithClient(
      <ErpInvoicePartnerSection
        detailInvoice={mockInvoice as any}
        direction="IN"
      />,
    );

    fireEvent.click(screen.getByText("Bảng kê HHDV"));

    await waitFor(() => {
      expect(erpInvoicesCoreApi.getItemsList).toHaveBeenCalledWith(
        expect.objectContaining({
          partner_tax_code: "0101234567",
          direction: "IN",
        }),
      );
    });
  });

  it("opens 'Bảng kê HHDV' when defaultPartnerSubTab is 'lines' (deep link từ danh sách HHDV)", async () => {
    renderWithClient(
      <ErpInvoicePartnerSection
        detailInvoice={mockInvoice as any}
        direction="IN"
        defaultPartnerSubTab="lines"
      />,
    );

    await waitFor(() => {
      expect(erpInvoicesCoreApi.getItemsList).toHaveBeenCalled();
    });
  });

  it("switches to 'Biến động & Phân tích' and renders analytics dashboard", async () => {
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
      <ErpInvoicePartnerSection
        detailInvoice={mockInvoice as any}
        direction="IN"
      />,
    );

    fireEvent.click(screen.getByText("Biến động & Phân tích"));

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

  it("shows empty partner message when invoice has NO partner info", async () => {
    const anonymousInvoice = {
      id: "inv-anon-1",
      direction: "OUT",
      buyerName: "",
      buyerTaxCode: "",
      buyerPersonalName: "",
      buyerCccd: "",
      sellerName: "GREENWAY",
      sellerTaxCode: "0318334886-003",
    };

    renderWithClient(
      <ErpInvoicePartnerSection
        detailInvoice={anonymousInvoice as any}
        direction="OUT"
        defaultPartnerSubTab="invoices"
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Không có thông tin đối tác"),
      ).toBeInTheDocument();
    });
  });
});
