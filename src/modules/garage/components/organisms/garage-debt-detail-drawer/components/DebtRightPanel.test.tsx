import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DebtRightPanel } from "./DebtRightPanel";
import type {
  GarageTrendItem,
  MonthlyReceivablesSummary,
  ReceivablesVatWarningSummary,
} from "@/modules/garage/api/garageDashboardApi";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, def?: string) => def || _k,
  }),
}));

const mockItem = {
  month: "2026-09",
  cost: 50000000,
  paidCost: 30000000,
  payableCost: 20000000,
  costPaymentRate: 60,
  costWithInvoice: 40000000,
  payableCostWithInvoice: 10000000,
  costNoInvoice: 10000000,
  payableCostNoInvoice: 10000000,
} as unknown as GarageTrendItem;

const mockSummary = {
  customer: {
    caseCount: 15,
    rate: 92.5,
    billed: 100000000,
    paid: 92500000,
    remaining: 7500000,
    withInvoiceAmount: 80000000,
    noInvoiceAmount: 20000000,
    vatWithoutInvoiceAmount: 1500000,
  },
  insurance: {
    caseCount: 5,
    rate: 100,
    billed: 50000000,
    paid: 50000000,
    remaining: 0,
    withInvoiceAmount: 50000000,
    noInvoiceAmount: 0,
    vatWithoutInvoiceAmount: 0,
  },
} as unknown as MonthlyReceivablesSummary;

const mockVatWarning: ReceivablesVatWarningSummary = {
  hasVatWithoutInvoice: true,
  casesWithVatNoInvoiceCount: 3,
  totalVatWithoutInvoice: 1500000,
};

describe("DebtRightPanel", () => {
  it("hiển thị banner VAT khi có cảnh báo và render đúng 2 DrawerSection", () => {
    render(
      <DebtRightPanel
        item={mockItem}
        breakdownSummary={mockSummary}
        vatWarningInfo={mockVatWarning}
        isReceipt={true}
      />,
    );

    // Kiểm tra Banner VAT compact
    expect(screen.getByText(/Cảnh báo VAT:/)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    // Kiểm tra tiêu đề 2 section
    expect(screen.getByText("Cơ cấu Thu KH vs Thu BH")).toBeInTheDocument();
    expect(screen.getByText("Chi phí phát sinh & Còn nợ")).toBeInTheDocument();

    // Kiểm tra thẻ Thu KH và Thu BH compact
    expect(screen.getByText("Thu Khách Hàng (15)")).toBeInTheDocument();
    expect(screen.getByText("92.5% Thu")).toBeInTheDocument();
    expect(screen.getByText("Thu Bảo Hiểm (5)")).toBeInTheDocument();
    expect(screen.getByText("100.0% Thu")).toBeInTheDocument();

    // Kiểm tra thẻ Chi phí DV & Phụ tùng compact
    expect(screen.getByText("Chi phí DV & Phụ tùng")).toBeInTheDocument();
    expect(screen.getByText("60.0% Trả")).toBeInTheDocument();
  });

  it("ẩn banner VAT khi không có cảnh báo", () => {
    render(
      <DebtRightPanel
        item={mockItem}
        breakdownSummary={mockSummary}
        vatWarningInfo={{
          hasVatWithoutInvoice: false,
          casesWithVatNoInvoiceCount: 0,
          totalVatWithoutInvoice: 0,
        }}
        isReceipt={true}
      />,
    );

    expect(screen.queryByText(/Cảnh báo VAT:/)).not.toBeInTheDocument();
  });
});
