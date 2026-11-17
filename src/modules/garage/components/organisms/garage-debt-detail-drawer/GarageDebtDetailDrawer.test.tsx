import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
    insuranceCategorized: emptyCategorized,
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
    "Cơ cấu Thu KH vs Thu BH",
    "Chi phí phát sinh & Còn nợ",
    "50.0% Hoàn tất",
  ];
  return labels.map((l) => ({ label: l, visible: !!screen.queryByText(l) }));
}

describe("GarageDebtDetailDrawer: một component cho tháng và mốc", () => {
  it("tháng và mốc hiển thị cùng tab, cùng panel phải, cùng badge", () => {
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
    expect(screen.queryByText("Danh sách vụ việc")).not.toBeInTheDocument();
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
