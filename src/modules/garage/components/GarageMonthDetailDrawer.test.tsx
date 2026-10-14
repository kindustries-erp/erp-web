import React, { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { GarageTrendItem } from "../api/garageDashboardApi";
import { GarageMonthDetailDrawer } from "./GarageMonthDetailDrawer";

vi.mock("@/shared/components/StandardFormDrawer", () => ({
  StandardFormDrawer: ({ tabs, rightPanel }: any) => {
    const [activeKey, setActiveKey] = useState(tabs[0].key);
    const activeTab = tabs.find((tab: any) => tab.key === activeKey);

    return (
      <div>
        <nav>
          {tabs.map((tab: any) => (
            <button key={tab.key} onClick={() => setActiveKey(tab.key)}>
              {tab.label}
            </button>
          ))}
        </nav>
        <main data-testid="drawer-left-panel">{activeTab.content}</main>
        <aside data-testid="drawer-right-panel">
          {activeTab.rightPanel ?? rightPanel}
        </aside>
      </div>
    );
  },
}));

vi.mock("@/shared/components/DataTable", () => {
  const createHeaderFilter = () => {
    const filter = (_key: string, label: string) => label;
    filter.amount = (_key: string, label: string) => label;
    filter.numeric = (_key: string, label: string) => label;
    return filter;
  };

  return {
    createColumnHeaderFilter: createHeaderFilter,
    filterClientItems: (items: unknown[]) => items,
  };
});

vi.mock("@/shared/hooks/useTableColumnState", () => ({
  useTableColumnState: () => ({}),
}));

vi.mock("../hooks/useGarageMonthReceivablesBreakdown", () => ({
  useGarageMonthReceivablesBreakdown: () => ({
    summary: {
      totalBilled: 1_500_000,
      customer: {
        billed: 1_000_000,
        paid: 600_000,
        remaining: 400_000,
        rate: 60,
        caseCount: 2,
        withInvoiceAmount: 800_000,
        noInvoiceAmount: 200_000,
        vatWithoutInvoiceAmount: 0,
      },
      insurance: {
        billed: 500_000,
        paid: 200_000,
        remaining: 300_000,
        rate: 40,
        caseCount: 1,
        withInvoiceAmount: 500_000,
        noInvoiceAmount: 0,
        vatWithoutInvoiceAmount: 0,
      },
    },
    insuranceCompanies: [],
    customerPartners: [],
    allGroups: [],
    warning: undefined,
  }),
}));

vi.mock(
  "./organisms/garage-month-detail-drawer/components/MonthClassificationTable",
  () => ({
    MonthClassificationTable: () => <div data-testid="classification-table" />,
  }),
);

vi.mock(
  "./organisms/garage-month-detail-drawer/components/MonthInvoicePartnerTable",
  () => ({
    MonthInvoicePartnerTable: ({ title }: { title: string }) => (
      <div>{title}</div>
    ),
  }),
);

vi.mock("./GarageMonthClassificationCasesDrawer", () => ({
  GarageMonthClassificationCasesDrawer: () => null,
}));

vi.mock("./organisms/garage-partner-month-detail-drawer", () => ({
  GaragePartnerMonthDetailDrawer: () => null,
}));

const item: GarageTrendItem = {
  label: "2026-10",
  revenue: 1_500_000,
  cost: 500_000,
  profit: 1_000_000,
  margin: 66.7,
  paid: 800_000,
  receivable: 700_000,
  tienCoThue: 1_500_000,
  collectionRate: 53.3,
  paidCost: 200_000,
  payableCost: 300_000,
  costPaymentRate: 40,
  collectionRateDiff: 0,
  costPaymentRateDiff: 0,
  caseCount: 3,
  billedSuaChuaChung: 1_500_000,
  paidSuaChuaChung: 800_000,
  rateSuaChuaChung: 53.3,
  costSuaChuaChung: 500_000,
  paidCostSuaChuaChung: 200_000,
  costRateSuaChuaChung: 40,
  caseCountSuaChuaChung: 3,
};

describe("GarageMonthDetailDrawer payer cards", () => {
  it("shows the shared payer section in both receipt tabs", () => {
    render(
      <GarageMonthDetailDrawer
        open
        item={item}
        activeTab="RECEIPT"
        onClose={vi.fn()}
      />,
    );

    const leftPanel = screen.getByTestId("drawer-left-panel");
    const rightPanel = screen.getByTestId("drawer-right-panel");
    expect(
      within(rightPanel).getByText("Cơ cấu Thu KH vs Thu BH"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Phân loại theo đối tượng"));

    expect(
      within(rightPanel).getByText("Cơ cấu Thu KH vs Thu BH"),
    ).toBeInTheDocument();
    expect(within(rightPanel).getByText(/Thu Khách Hàng/)).toBeInTheDocument();
    expect(within(rightPanel).getByText(/Thu Bảo Hiểm/)).toBeInTheDocument();
    expect(within(leftPanel).getByText("Thu khách hàng")).toBeInTheDocument();
    expect(within(leftPanel).getByText("Thu bảo hiểm")).toBeInTheDocument();
    expect(within(leftPanel).queryByText(/Cơ cấu Thu KH vs Thu BH/)).toBeNull();
  });

  it("does not expose invoice-partner content in payment mode", () => {
    render(
      <GarageMonthDetailDrawer
        open
        item={item}
        activeTab="PAYMENT"
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.queryByText("Phân loại theo đối tượng"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Cơ cấu Thu KH vs Thu BH")).toBeNull();
  });
});
