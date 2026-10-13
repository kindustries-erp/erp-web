import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuoteDocumentSummary } from "../QuoteDocumentSummary";
import type { QuoteProfitSummaryData } from "../../../GarageCasePreview.type";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, opts?: any) => {
      if (typeof opts === "string") return opts;
      if (opts && typeof opts === "object" && opts.defaultValue) {
        return typeof opts.defaultValue === "string" ? opts.defaultValue : _k;
      }
      return _k;
    },
  }),
}));

describe("QuoteDocumentSummary", () => {
  const mockProfitSummary: QuoteProfitSummaryData = {
    revenue: 1500000,
    totalCost: 220000,
    partCost: 0,
    grossProfit: 855000,
    profitMargin: 57,
    hasProfitData: true,
    totalAmount: 1500000,
    discountAmount: 225000,
    discountRate: 15,
    subtotalAfterDiscount: 1275000,
    deductibleAmount: 500000,
    sanctionAmount: 0,
    afterSanctionAmount: 775000,
    customerPay: 540000,
    insurancePay: 837000,
    vatAmount: 102000,
    totalPayable: 1377000,
    commissionGeneral: 0,
    commissionGdv: 200000,
    gdvName: "Bảo Việt",
    commissionMg: 0,
    brokerName: null,
    partsCostInside: 0,
    partsCostOutside: 0,
    outsourceLaborCost: 220000,
    estimatedProfitPreTax: 855000,
    estimatedProfitAfterTax: 957000,
    isInsurance: true,
  };

  const mockRawData = {
    TongTienHang: 1275000,
    TienChuaThue: 1500000,
    TienChietKhau: 225000,
    TienThue: 102000,
    TienThanhToanKH: 540000,
    TienThanhToanBH: 837000,
  };

  it("renders all 5 financial groups matching GR-PDV2606-0025 quote", () => {
    render(
      <QuoteDocumentSummary
        rawData={mockRawData}
        caseData={{}}
        profitSummary={mockProfitSummary}
      />,
    );

    // 1. Revenue & Discount group
    expect(screen.getByText("1.500.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("-225.000 ₫")).toBeInTheDocument();
    expect(screen.getAllByText("1.275.000 ₫")).toHaveLength(2);

    // 2. Settlement group
    expect(screen.getByText("500.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("775.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("102.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("540.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("837.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("1.377.000 ₫")).toBeInTheDocument();

    // 3. Commissions group
    expect(screen.getAllByText("200.000 ₫")).toHaveLength(2);

    // 4. Direct cost & GCN group
    expect(screen.getAllByText("220.000 ₫")).toHaveLength(2);

    // 5. Profit highlight group
    expect(screen.getByText("855.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("957.000 ₫")).toBeInTheDocument();
  });
});
