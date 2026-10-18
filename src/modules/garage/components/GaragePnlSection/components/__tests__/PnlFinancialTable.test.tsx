import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PnlFinancialTable } from "../PnlFinancialTable";
import { mockPnlReport } from "./mockReport.fixture";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal: string) => defaultVal,
  }),
}));

describe("PnlFinancialTable Component", () => {
  it("renders all 8 sections in default view mode with Roman numerals and OJ sub-rows", () => {
    render(
      <PnlFinancialTable
        report={mockPnlReport}
        prevReport={mockPnlReport}
        prev2Report={mockPnlReport}
        isLoading={false}
        isLoadingPrev={false}
        isLoadingPrev2={false}
        selectedMonth={7}
        selectedYear={2026}
        prevMonth={6}
        prevYear={2026}
        prev2Month={5}
        prev2Year={2026}
        isOjOnly={false}
        onOpenDrawer={vi.fn()}
      />,
    );

    // Headers
    expect(screen.getByText("Tháng 07/2026")).toBeInTheDocument();
    expect(screen.getByText("Tháng 06/2026")).toBeInTheDocument();
    expect(screen.getByText("Tháng 05/2026")).toBeInTheDocument();

    // 8 headers with Roman numerals
    expect(screen.getByText("I. Doanh Thu")).toBeInTheDocument();
    expect(screen.getByText("II. Chi phí (Giá vốn)")).toBeInTheDocument();
    expect(screen.getByText("III. Lợi nhuận gộp")).toBeInTheDocument();
    expect(screen.getByText("IV. Chi phí bán hàng")).toBeInTheDocument();
    expect(screen.getByText("V. Chi phí vận hành")).toBeInTheDocument();
    expect(screen.getByText("VI. Lợi nhuận ròng")).toBeInTheDocument();
    expect(
      screen.getByText("VII. Thưởng và Hoa hồng Dịch vụ"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("VIII. Lợi nhuận giữ lại của Garage (Sau hoa hồng DV)"),
    ).toBeInTheDocument();

    // Sub-rows
    expect(
      screen.getByText("1.1.1. Trong đó: Phát sinh liên quan OJ"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("2.1.1. Trong đó: Phát sinh liên quan OJ"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("3.1. Trong đó: Lợi nhuận gộp mảng OJ"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("5.1.1. Trong đó: Phát sinh liên quan OJ"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("6.1. Trong đó: Lợi nhuận ròng mảng OJ"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("7.1.1. Trong đó: Phát sinh liên quan OJ"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("8.1. Trong đó: Lợi nhuận giữ lại mảng OJ"),
    ).toBeInTheDocument();
  });

  it("renders correctly in OJ Only view mode hiding sub-rows and binding OJ metrics", () => {
    render(
      <PnlFinancialTable
        report={mockPnlReport}
        prevReport={mockPnlReport}
        prev2Report={mockPnlReport}
        isLoading={false}
        isLoadingPrev={false}
        isLoadingPrev2={false}
        selectedMonth={7}
        selectedYear={2026}
        prevMonth={6}
        prevYear={2026}
        prev2Month={5}
        prev2Year={2026}
        isOjOnly={true}
        onOpenDrawer={vi.fn()}
      />,
    );

    // 8 headers still exist with Roman numerals
    expect(screen.getByText("I. Doanh Thu")).toBeInTheDocument();
    expect(screen.getByText("II. Chi phí (Giá vốn)")).toBeInTheDocument();
    expect(screen.getByText("III. Lợi nhuận gộp")).toBeInTheDocument();
    expect(screen.getByText("VI. Lợi nhuận ròng")).toBeInTheDocument();
    expect(
      screen.getByText("VII. Thưởng và Hoa hồng Dịch vụ"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("VIII. Lợi nhuận giữ lại của Garage (Sau hoa hồng DV)"),
    ).toBeInTheDocument();

    // OJ sub-rows MUST NOT be displayed when viewing OJ only
    expect(
      screen.queryByText("1.1.1. Trong đó: Phát sinh liên quan OJ"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("2.1.1. Trong đó: Phát sinh liên quan OJ"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("3.1. Trong đó: Lợi nhuận gộp mảng OJ"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("5.1.1. Trong đó: Phát sinh liên quan OJ"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("6.1. Trong đó: Lợi nhuận ròng mảng OJ"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("7.1.1. Trong đó: Phát sinh liên quan OJ"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("8.1. Trong đó: Lợi nhuận giữ lại mảng OJ"),
    ).not.toBeInTheDocument();

    // Verify OJ Revenue and OJ Gross Profit numbers appear
    expect(screen.getAllByText("50.000.000 đ").length).toBeGreaterThan(0);
    expect(screen.getAllByText("20.000.000 đ").length).toBeGreaterThan(0);
  });

  it("toggles section collapse when clicking Level 1 header cell", () => {
    render(
      <PnlFinancialTable
        report={mockPnlReport}
        prevReport={mockPnlReport}
        prev2Report={mockPnlReport}
        isLoading={false}
        isLoadingPrev={false}
        selectedMonth={7}
        selectedYear={2026}
        prevMonth={6}
        prevYear={2026}
        onOpenDrawer={vi.fn()}
      />,
    );

    // Initial state: sub-row 1.1 is present
    expect(screen.getByText("1.1. Doanh Thu Dịch Vụ")).toBeInTheDocument();

    // Click on "I. Doanh Thu" to collapse
    fireEvent.click(screen.getByText("I. Doanh Thu"));
    expect(
      screen.queryByText("1.1. Doanh Thu Dịch Vụ"),
    ).not.toBeInTheDocument();

    // Click again to expand
    fireEvent.click(screen.getByText("I. Doanh Thu"));
    expect(screen.getByText("1.1. Doanh Thu Dịch Vụ")).toBeInTheDocument();
  });

  it("collapses all and expands all using global toggle button", () => {
    render(
      <PnlFinancialTable
        report={mockPnlReport}
        prevReport={mockPnlReport}
        prev2Report={mockPnlReport}
        isLoading={false}
        isLoadingPrev={false}
        selectedMonth={7}
        selectedYear={2026}
        prevMonth={6}
        prevYear={2026}
        onOpenDrawer={vi.fn()}
      />,
    );

    // Initial state: sub-rows present
    expect(screen.getByText("1.1. Doanh Thu Dịch Vụ")).toBeInTheDocument();
    expect(
      screen.getByText("2.1. Chi phí phụ tùng & Gia công ngoài (từ vụ việc)"),
    ).toBeInTheDocument();

    // Find and click global collapse button
    const toggleBtn = screen.getByTitle("Thu gọn tất cả");
    fireEvent.click(toggleBtn);

    // Sub-rows should now be collapsed
    expect(
      screen.queryByText("1.1. Doanh Thu Dịch Vụ"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("2.1. Chi phí phụ tùng & Gia công ngoài (từ vụ việc)"),
    ).not.toBeInTheDocument();

    // Click again to expand all
    fireEvent.click(screen.getByTitle("Mở rộng tất cả"));
    expect(screen.getByText("1.1. Doanh Thu Dịch Vụ")).toBeInTheDocument();
    expect(
      screen.getByText("2.1. Chi phí phụ tùng & Gia công ngoài (từ vụ việc)"),
    ).toBeInTheDocument();
  });
});
