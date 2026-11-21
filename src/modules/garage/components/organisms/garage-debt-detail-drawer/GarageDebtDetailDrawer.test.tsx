import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";
import { GarageDebtDetailDrawer } from "./GarageDebtDetailDrawer";
import type { DebtDetailScope } from "./GarageDebtDetailDrawer.type";

const emptyCategorized = {
  all: [],
  withInvoice: [],
  pendingInvoice: [],
  noInvoice: [],
  totals: { billed: 0, paid: 0, remaining: 0, caseCount: 0, partnerCount: 0 },
};

const mockCategorizedWithCases = {
  all: [
    {
      key: "BH_01",
      payerType: "BH" as const,
      title: "Bảo hiểm PVI",
      buyerName: "Bảo hiểm PVI",
      billed: 500,
      paid: 200,
      remaining: 300,
      caseCount: 1,
      hasInvoice: true,
      invoiceNos: ["PVI-01"],
      hasVat: true,
      vatAmount: 50,
      vatWarning: false,
      cases: [
        {
          id: "c-101",
          soChungTu: "SC-101",
          bienSoXe: "30A-99999",
          khachHangName: "Bảo hiểm PVI",
          amount: 500,
          paid: 200,
          remaining: 300,
          cost: 200,
          paidCost: 50,
          remainingCost: 150,
          vatAmount: 50,
          vatWarning: false,
        },
      ],
    },
  ],
  withInvoice: [],
  pendingInvoice: [],
  noInvoice: [],
  totals: {
    billed: 500,
    paid: 200,
    remaining: 300,
    caseCount: 1,
    partnerCount: 1,
  },
};

vi.mock("@/modules/garage/hooks/useGarageMonthReceivablesBreakdown", () => ({
  useGarageMonthReceivablesBreakdown: () => ({
    breakdown: { monthLabel: "Quá hạn 31-60 ngày" },
    trendItem: {
      label: "overdue31To60",
      tienCoThue: 1000,
      paid: 500,
      receivable: 500,
      collectionRate: 50,
      cost: 400,
      paidCost: 100,
      payableCost: 300,
      costPaymentRate: 25,
      caseCount: 2,
    },
    summary: {
      totalBilled: 1000,
      totalPaid: 500,
      totalRemaining: 500,
      collectionRate: 50,
      customer: {
        billed: 800,
        paid: 400,
        remaining: 400,
        rate: 50,
        caseCount: 1,
        withInvoiceAmount: 800,
        noInvoiceAmount: 0,
        vatWithoutInvoiceAmount: 0,
      },
      insurance: {
        billed: 200,
        paid: 100,
        remaining: 100,
        rate: 50,
        caseCount: 1,
        withInvoiceAmount: 200,
        noInvoiceAmount: 0,
        vatWithoutInvoiceAmount: 0,
      },
    },
    insuranceCategorized: mockCategorizedWithCases,
    enterpriseCategorized: emptyCategorized,
    individualCategorized: emptyCategorized,
    warning: undefined,
    isLoading: false,
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, def?: string) => def || _k,
  }),
}));

const monthItem = {
  label: "2026-10",
  tienCoThue: 1000,
  paid: 500,
  receivable: 500,
  collectionRate: 50,
  cost: 400,
  paidCost: 100,
  payableCost: 300,
  costPaymentRate: 25,
  caseCount: 2,
} as GarageTrendItem;

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderScope(scope: DebtDetailScope) {
  return render(
    <QueryClientProvider client={queryClient}>
      <GarageDebtDetailDrawer open onClose={vi.fn()} scope={scope} />
    </QueryClientProvider>,
  );
}

/** Các phần nhìn thấy được của drawer: tab, panel phải, badge tỷ lệ. */
function visibleShape() {
  const labels = [
    "Phân loại Nghiệp vụ",
    "Phân loại theo đối tượng",
    "Phiếu còn công nợ",
    "Cơ cấu Thu KH vs Thu BH",
    "Chi phí phát sinh & Còn nợ",
    "50.0% Hoàn tất",
  ];
  return labels.map((l) => ({ label: l, visible: !!screen.queryByText(l) }));
}

describe("GarageDebtDetailDrawer: một component cho tháng và mốc (3 tabs)", () => {
  it("tháng và mốc hiển thị cùng đủ 3 tabs, cùng panel phải, cùng badge", () => {
    const month = renderScope({ kind: "month", item: monthItem });
    const monthShape = visibleShape();
    expect(screen.getByText("Tháng 10/2026")).toBeInTheDocument();
    month.unmount();

    renderScope({
      kind: "horizon",
      horizon: "overdue31To60",
      branchId: "branch-01",
    });
    const horizonShape = visibleShape();
    expect(screen.getByText("Quá hạn 31-60 ngày")).toBeInTheDocument();

    expect(horizonShape).toEqual(monthShape);
    expect(monthShape.every((s) => s.visible)).toBe(true);
  });

  it("chuyển sang tab Phiếu còn công nợ hiển thị danh sách phiếu", () => {
    renderScope({ kind: "month", item: monthItem });

    const unpaidTabButton = screen.getByText("Phiếu còn công nợ");
    expect(unpaidTabButton).toBeInTheDocument();
    fireEvent.click(unpaidTabButton);

    // Phiếu SC-101 từ mockCategorizedWithCases có remaining = 300 phải hiển thị
    expect(screen.getByText("SC-101")).toBeInTheDocument();
  });

  it("không render gì khi chưa có scope", () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <GarageDebtDetailDrawer open onClose={vi.fn()} scope={null} />
      </QueryClientProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
