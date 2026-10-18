import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCaseFinancialsRightPanel } from "./GarageCaseFinancialsRightPanel";

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

vi.mock("./context/GarageCaseFinancialsContext", () => ({
  useGarageCaseFinancials: () => ({
    caseSummary: null,
    settlementType: "RECEIPT",
    activeTab: "invoices_out",
    domainDirection: "REVENUE",
    setDomainDirection: vi.fn(),
    targetRevenue: 1296000,
    targetCost: 750000,
    totalCollected: 0,
    totalPaid: 0,
    activeTabSettlementTotal: 0,
    isPaidFull: false,
    paymentPercent: 0,
    remainingDebt: 1296000,
    remainingAfterNetOff: 1296000,
    selectedIds: [],
    selectedInvoicesCount: 0,
    invoiceNote: "",
    editMode: false,
    setSettlementType: vi.fn(),
    setInvoiceNote: vi.fn(),
  }),
}));

describe("GarageCaseFinancialsRightPanel", () => {
  const mockCaseData = {
    id: "case-001",
    soChungTu: "GR-PDV2610-0003",
    bienSoXe: "50LD17947",
    khachHangName: "Công ty ABC",
    tenTinhTrangDichVu: "Kết thúc",
    doanhThu: 1296000,
    chiPhi: 750000,
    loiNhuan: 546000,
  };

  it("renders General Info section with Info icon and Business Performance section", () => {
    render(
      <GarageCaseFinancialsRightPanel
        caseId="case-001"
        caseCode="GR-PDV2610-0003"
        caseData={mockCaseData}
      />,
    );

    // Section 1: Thông tin chung
    expect(screen.getByText("Thông tin chung")).toBeInTheDocument();
    expect(screen.getByText("50LD17947")).toBeInTheDocument();

    // Section 2: Hiệu quả kinh doanh & Lợi nhuận
    expect(
      screen.getByText("Hiệu quả kinh doanh & Lợi nhuận"),
    ).toBeInTheDocument();
    expect(screen.getByText("Doanh thu (chưa thuế)")).toBeInTheDocument();
    expect(screen.getByText("Tổng chi phí vụ việc")).toBeInTheDocument();

    // Old Section 3 ("Hiệu quả lợi nhuận gộp") should NOT be rendered
    expect(
      screen.queryByText("Hiệu quả lợi nhuận gộp"),
    ).not.toBeInTheDocument();
  });
});
