import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PnlFinancialTable } from "../PnlFinancialTable";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal: string) => defaultVal,
  }),
}));

const mockReport: GaragePnlReportResponse = {
  period: { year: 2026, month: 7 },
  periodStr: "07/2026",
  caseCount: 15,
  revenue: 444218804,
  cogs: 241508218,
  cogsDirect: 241508218,
  grossProfit: 202710586,
  grossMarginRate: 45.63,
  sellingExpenses: {
    total: 2000000,
    ojTotal: 0,
    items: [],
  },
  opex: {
    total: 146500000,
    ojTotal: 10000000,
    items: [
      {
        categoryKey: "NHAN_SU",
        categoryName: "Nhân sự",
        amount: 76500000,
        ojAmount: 5000000,
      },
    ],
  },
  netProfit: 54210586,
  netProfitBeforeCommission: 56210586,
  serviceCommission: {
    total: 5421059,
    ojTotal: 0,
    dvCommission: 5421059,
    items: [],
  },
  commission: {
    total: 7421059,
    ojTotal: 0,
    auto: {
      kyGuiGrossProfit: 40000000,
      totalGrossProfit: 202710586,
      kyGuiProfitRate: 19.73,
      saleCommissionRate: 10,
      saleCommission: 2000000,
      dvCommissionRate: 10,
      dvCommission: 5421059,
      totalAuto: 7421059,
    },
    items: [],
  },
  netProfitAfterCommission: 48789527,
  netMarginRate: 10.98,
  oj: {
    caseCount: 2,
    revenue: 50000000,
    revenueRatio: 11.25,
    cogs: 30000000,
    cogsDirect: 30000000,
    cogsAdjustmentTotal: 0,
    grossProfit: 20000000,
    grossMarginRate: 40.0,
    sellingExpensesTotal: 0,
    opexTotal: 10000000,
    netProfit: 10000000,
    netProfitBeforeCommission: 10000000,
    serviceCommissionTotal: 1000000,
    commissionTotal: 1000000,
    commissionAuto: {
      kyGuiProfitRate: 0,
      saleCommission: 0,
      dvCommission: 1000000,
      totalAuto: 1000000,
    },
    netProfitAfterCommission: 9000000,
    netMarginRate: 18.0,
  },
};

describe("PnlFinancialTable Component", () => {
  it("renders all 8 standardized numeric sections (1..8) correctly", () => {
    render(
      <PnlFinancialTable
        report={mockReport}
        prevReport={mockReport}
        prev2Report={mockReport}
        isLoading={false}
        isLoadingPrev={false}
        isLoadingPrev2={false}
        selectedMonth={7}
        selectedYear={2026}
        prevMonth={6}
        prevYear={2026}
        prev2Month={5}
        prev2Year={2026}
        onOpenDrawer={vi.fn()}
      />,
    );

    // Verify 3 Month Column Headers exist and OJ Column Header is removed
    expect(screen.getByText("Tháng 07/2026")).toBeInTheDocument();
    expect(screen.getByText("Tháng 06/2026")).toBeInTheDocument();
    expect(screen.getByText("Tháng 05/2026")).toBeInTheDocument();
    expect(screen.queryByText(/Phát sinh OJ \(T/i)).not.toBeInTheDocument();

    // 1. Doanh thu
    expect(screen.getByText("1. Doanh Thu")).toBeInTheDocument();
    expect(screen.getByText("1.1. Doanh Thu Dịch Vụ")).toBeInTheDocument();
    expect(
      screen.getByText("1.1.1. Trong đó: Phát sinh liên quan OJ"),
    ).toBeInTheDocument();

    // 2. Chi phí giá vốn
    expect(screen.getByText("2. Chi phí (Giá vốn)")).toBeInTheDocument();
    expect(
      screen.getByText("2.1. Chi phí phụ tùng & Gia công ngoài (từ vụ việc)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("2.1.1. Trong đó: Phát sinh liên quan OJ"),
    ).toBeInTheDocument();

    // 3. Lợi nhuận gộp
    expect(screen.getByText("3. Lợi nhuận gộp")).toBeInTheDocument();
    expect(
      screen.getByText("3.1. Trong đó: Lợi nhuận gộp mảng OJ"),
    ).toBeInTheDocument();

    // 4. Chi phí bán hàng
    expect(screen.getByText("4. Chi phí bán hàng")).toBeInTheDocument();
    expect(
      screen.getByText("4.1. Hoa hồng cho Sale (10%)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("4.1.1. Tỷ lệ lãi gộp ký gửi / Lãi gộp"),
    ).toBeInTheDocument();

    // 5. Chi phí vận hành
    expect(screen.getByText("5. Chi phí vận hành")).toBeInTheDocument();
    expect(screen.getByText("5.1. Nhân sự")).toBeInTheDocument();
    expect(
      screen.getByText("5.1.1. Trong đó: Phát sinh liên quan OJ"),
    ).toBeInTheDocument();

    // 6. Lợi nhuận ròng
    expect(screen.getByText("6. Lợi nhuận ròng")).toBeInTheDocument();
    expect(
      screen.getByText("6.1. Trong đó: Lợi nhuận ròng mảng OJ"),
    ).toBeInTheDocument();

    // 7. Thưởng & Hoa hồng DV
    expect(
      screen.getByText("7. Thưởng và Hoa hồng Dịch vụ"),
    ).toBeInTheDocument();
    expect(screen.getByText("7.1. Hoa hồng cho DV (10%)")).toBeInTheDocument();
    expect(
      screen.getByText("7.1.1. Trong đó: Phát sinh liên quan OJ"),
    ).toBeInTheDocument();

    // 8. Lợi nhuận giữ lại
    expect(
      screen.getByText("8. Lợi nhuận giữ lại của Garage (Sau hoa hồng DV)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("8.1. Trong đó: Lợi nhuận giữ lại mảng OJ"),
    ).toBeInTheDocument();

    // Verify Two-tier cells render rate % sub-text correctly
    expect(screen.getAllByText(/% DT/i).length).toBeGreaterThan(0);
  });
});
