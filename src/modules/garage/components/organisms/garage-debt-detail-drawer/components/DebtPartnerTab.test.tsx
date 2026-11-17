import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DebtPartnerTab } from "./DebtPartnerTab";
import type { MonthlyReceivablesGroupCategorized } from "@/modules/garage/api/garageDashboardApi";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, def?: string) => def || _k,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const createMockGroup = (
  prefix: string,
): MonthlyReceivablesGroupCategorized => {
  const item = {
    key: `${prefix}_1`,
    payerType: "KH" as const,
    title: `${prefix} Đối tác 1`,
    buyerName: `${prefix} Đối tác 1`,
    billed: 1000,
    paid: 500,
    remaining: 500,
    rate: 50,
    shareRate: 33.3,
    caseCount: 1,
    hasInvoice: true,
    invoiceNos: ["001"],
    hasVat: false,
    vatAmount: 0,
    vatWarning: false,
    cases: [],
  };
  return {
    all: [item],
    withInvoice: [item],
    pendingInvoice: [],
    noInvoice: [],
    totals: {
      billed: 1000,
      paid: 500,
      remaining: 500,
      caseCount: 1,
      partnerCount: 1,
    },
  };
};

describe("DebtPartnerTab", () => {
  const safeCategorized = {
    enterprise: createMockGroup("DN"),
    individual: createMockGroup("CN"),
    insurance: createMockGroup("BH"),
  };

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <DebtPartnerTab
          safeCategorized={safeCategorized}
          partnerDebtType="receivables"
          onPartnerDebtTypeChange={vi.fn()}
          effectiveBreakdownTotal={3000}
          onSelectGroup={vi.fn()}
        />
      </QueryClientProvider>,
    );

  it("ở tab Tất cả đối tượng, chỉ hiển thị đúng 1 bảng tổng hợp duy nhất", () => {
    renderComponent();

    // Tiêu đề của bảng tổng hợp duy nhất
    expect(screen.getByText("Thu tất cả đối tượng")).toBeInTheDocument();

    // Đối tác DN, CN, BH đều xuất hiện trong bảng gộp duy nhất
    expect(screen.getAllByText("DN Đối tác 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("CN Đối tác 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("BH Đối tác 1").length).toBeGreaterThan(0);
  });

  it("chuyển sang tab KH Doanh nghiệp hiển thị các phân đoạn HĐ của nhóm doanh nghiệp", () => {
    renderComponent();

    const entTab = screen.getByText("KH Doanh nghiệp");
    fireEvent.click(entTab);

    // Không còn bảng gộp "Thu tất cả đối tượng"
    expect(screen.queryByText("Thu tất cả đối tượng")).not.toBeInTheDocument();

    // Xuất hiện phân đoạn Đã xuất hóa đơn
    expect(screen.getByText("Đã xuất hóa đơn")).toBeInTheDocument();
    expect(screen.getAllByText("DN Đối tác 1").length).toBeGreaterThan(0);

    // Không xuất hiện đối tác cá nhân và bảo hiểm
    expect(screen.queryByText("CN Đối tác 1")).not.toBeInTheDocument();
    expect(screen.queryByText("BH Đối tác 1")).not.toBeInTheDocument();
  });
});
