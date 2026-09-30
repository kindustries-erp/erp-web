import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErpInvoicePartnerInvoicesSection } from "./ErpInvoicePartnerInvoicesSection";
import { invoiceDebtsApi } from "@/modules/accounting/api/invoiceDebtsApi";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

vi.mock("@/modules/accounting/api/invoiceDebtsApi", () => ({
  invoiceDebtsApi: {
    getPartnerInvoices: vi.fn(),
  },
}));

const mockInvoices = [
  {
    id: "inv-1",
    invoiceNo: "162",
    serialNo: "C26TYY",
    invoiceDate: "2026-05-14",
    direction: "IN",
    preVatAmount: 6000000,
    vatRate: "8%",
    vatAmount: 480000,
    totalAmount: 6480000,
    paidAmount: 6480000,
    balanceAmount: 0,
    agingDays: 15,
    status: "CONFIRMED",
    description: "Phí dịch vụ tư vấn",
  },
  {
    id: "inv-2",
    invoiceNo: "163",
    serialNo: "C26TYY",
    invoiceDate: "2026-05-14",
    direction: "IN",
    preVatAmount: 6000000,
    vatRate: "8%",
    vatAmount: 480000,
    totalAmount: 6480000,
    paidAmount: 0,
    balanceAmount: 6480000,
    agingDays: 45,
    status: "CONFIRMED",
    description: "Phí dịch vụ tư vấn đợt 2",
  },
];

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

describe("ErpInvoicePartnerInvoicesSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (invoiceDebtsApi.getPartnerInvoices as any).mockResolvedValue(mockInvoices);
  });

  it("renders table with all required columns: Số HĐ, Đã cấn trừ, Còn nợ, Tuổi nợ", async () => {
    renderWithClient(
      <ErpInvoicePartnerInvoicesSection
        taxCode="0317172914"
        partnerName="CÔNG TY TƯ VẤN LUẬT THIÊN THỦY"
        partnerType="SUPPLIER"
        direction="IN"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Số HĐ")).toBeInTheDocument();
      expect(screen.getByText("Đã cấn trừ")).toBeInTheDocument();
      expect(screen.getByText("Còn nợ")).toBeInTheDocument();
      expect(screen.getByText("Tuổi nợ")).toBeInTheDocument();
      expect(screen.getByText("0-30 ngày")).toBeInTheDocument();
      expect(screen.getByText("31-60 ngày")).toBeInTheDocument();
    });
  });

  it("displays invoices data, aging badges and settled state", async () => {
    renderWithClient(
      <ErpInvoicePartnerInvoicesSection
        taxCode="0317172914"
        partnerName="CÔNG TY TƯ VẤN LUẬT THIÊN THỦY"
        partnerType="SUPPLIER"
        direction="IN"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("162")).toBeInTheDocument();
      expect(screen.getByText("163")).toBeInTheDocument();
      expect(screen.getByText("Đã tất toán")).toBeInTheDocument();
      expect(screen.getByText("45 ngày")).toBeInTheDocument();
    });
  });

  it("calls onPreviewInvoice when invoice is clicked", async () => {
    const handlePreview = vi.fn();
    renderWithClient(
      <ErpInvoicePartnerInvoicesSection
        taxCode="0317172914"
        partnerName="CÔNG TY TƯ VẤN LUẬT THIÊN THỦY"
        partnerType="SUPPLIER"
        direction="IN"
        onPreviewInvoice={handlePreview}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("162")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("162"));
    expect(handlePreview).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceNo: "162" }),
    );
  });
});
