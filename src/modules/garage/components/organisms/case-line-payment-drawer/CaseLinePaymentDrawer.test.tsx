import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CaseLinePaymentDrawer } from "./CaseLinePaymentDrawer";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, opts?: any) => {
      if (typeof opts === "string") return opts;
      if (opts && typeof opts === "object" && opts.defaultValue) {
        return typeof opts.defaultValue === "string" ? opts.defaultValue : k;
      }
      return k;
    },
  }),
}));

let mockReconOverrides: Record<string, any> = {};

vi.mock(
  "../../GarageCaseReconciliationDrawer/useGarageCaseReconciliationLogic",
  () => ({
    useGarageCaseReconciliationLogic: () => ({
      activeTab: "invoices_out",
      setActiveTab: vi.fn(),
      invoiceItems: [],
      selectedInvoicesList: [],
      selectedInvoicesCount: 0,
      selectedInvoicesTotal: 0,
      selectedInvoicesMap: {},
      displayInvoiceTotal: 0,
      displayInvoiceTotalPages: 1,
      invoicePage: 1,
      invoicePageSize: 10,
      isLoadingInvoices: false,
      invoiceDateFrom: "",
      invoiceDateTo: "",
      invoiceTableState: {
        activeFilterCount: 0,
        sorts: ["-invoiceDate"],
        columnFilters: {},
        columnSearch: {},
      },
      handleToggleInvoice: vi.fn(),
      handleSelectAllInvoices: vi.fn(),
      setViewInvoiceId: vi.fn(),
      setPreviewPdf: vi.fn(),
      setInvoicePage: vi.fn(),
      setInvoicePageSize: vi.fn(),
      setInvoiceDateFrom: vi.fn(),
      setInvoiceDateTo: vi.fn(),
      viewPreset: "all",
      handleSelectAllSuggestions: vi.fn(),
      invoiceSuggestions: [],
      activeSettlements: [],
      pendingManualSettlements: [],
      onRemoveSettlement: vi.fn(),
      manualAmount: 0,
      manualCategory: "TIEN_MAT_NGOAI",
      manualDate: "2026-03-01",
      manualPartner: "",
      manualNote: "",
      setManualAmount: vi.fn(),
      setManualCategory: vi.fn(),
      setManualDate: vi.fn(),
      setManualPartner: vi.fn(),
      setManualNote: vi.fn(),
      handleAddManualSettlement: vi.fn(),
      handleAddManualToDraft: vi.fn(),
      manualDraftPending: false,
      hasInvoiceChanges: false,
      isSubmitting: false,
      handleSubmitInvoices: vi.fn(),
      handleSubmitBankAndCash: vi.fn(),
      ...mockReconOverrides,
    }),
  }),
);

describe("CaseLinePaymentDrawer", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  beforeEach(() => {
    mockReconOverrides = {};
  });

  it("renders correctly when open", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CaseLinePaymentDrawer
          open={true}
          onClose={vi.fn()}
          caseId="case-1"
          lineId="line-1"
          lineCode="PT-01"
          lineName="Lọc nhớt"
          lineAmount={300000}
          lineType="PT"
          payer="KH"
        />
      </QueryClientProvider>,
    );

    expect(screen.getAllByText(/Lọc nhớt/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/300.000/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Khoản mục cấn trừ/i)).toBeInTheDocument();
  });

  it("renders cost settlement correctly when direction is COST", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CaseLinePaymentDrawer
          open={true}
          onClose={vi.fn()}
          caseId="case-1"
          lineId="line-2"
          lineCode="PT-02"
          lineName="Bugi đánh lửa"
          lineAmount={500000}
          lineType="PT"
          direction="COST"
          payer="GARAGE"
        />
      </QueryClientProvider>,
    );

    expect(screen.getAllByText(/Chi tiền:/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/1. HĐ Đầu vào/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Chi ngoài sổ/i)).toBeInTheDocument();
  });

  it("updates footer action button when switching to manual cashflow tab", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CaseLinePaymentDrawer
          open={true}
          onClose={vi.fn()}
          caseId="case-1"
          lineId="line-1"
          lineCode="DV-01"
          lineName="Công thợ"
          lineAmount={200000}
          lineType="DV"
          direction="REVENUE"
          payer="KH"
        />
      </QueryClientProvider>,
    );

    const manualTab = screen.getByText(/2. Thu ngoài sổ/i);
    expect(manualTab).toBeInTheDocument();
    fireEvent.click(manualTab);

    expect(
      screen.getByRole("button", { name: /Ghi nhận thu ngoài sổ/i }),
    ).toBeInTheDocument();
  });

  it("renders 'Thông tin sổ báo giá' and target amount in right panel", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CaseLinePaymentDrawer
          open={true}
          onClose={vi.fn()}
          caseId="case-1"
          caseCode="GR-PDV2609-0056"
          caseData={{
            soChungTu: "GR-PDV2609-0056",
            bienSoXe: "50E-123.45",
            khachHangName: "CÔNG TY ABC",
            tienCoThue: 9018000,
          }}
          lineId="line-2"
          lineCode="PT-02"
          lineName="Bugi đánh lửa"
          lineAmount={500000}
          lineType="PT"
          direction="COST"
          payer="GARAGE"
        />
      </QueryClientProvider>,
    );

    // Section 1: Khoản mục cấn trừ có số tiền cần cấn trừ
    expect(screen.getByText(/Khoản mục cấn trừ/i)).toBeInTheDocument();
    expect(screen.getByText(/Số tiền cần cấn trừ/i)).toBeInTheDocument();
    expect(screen.getAllByText(/500.000 ₫/i).length).toBeGreaterThanOrEqual(2);

    // Section 2: Thông tin sổ báo giá
    expect(screen.getByText(/Thông tin sổ báo giá/i)).toBeInTheDocument();
    expect(screen.getByText(/GR-PDV2609-0056/i)).toBeInTheDocument();
    expect(screen.getByText(/50E-123.45/i)).toBeInTheDocument();
    expect(screen.getByText(/CÔNG TY ABC/i)).toBeInTheDocument();
    expect(screen.getByText(/9.018.000 ₫/i)).toBeInTheDocument();
  });
});
