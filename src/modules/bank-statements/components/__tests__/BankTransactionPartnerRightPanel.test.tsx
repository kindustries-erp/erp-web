// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BankTransactionPartnerRightPanel } from "../BankTransactionPartnerRightPanel";

vi.mock("@/modules/bank-statements/api/bankStatementApi", () => ({
  bankStatementApi: {
    getDashboardStats: vi.fn().mockResolvedValue({
      cashTrend: [],
      totalCashIn: 1000000,
      totalCashOut: 500000,
      netCashFlow: 500000,
    }),
  },
}));

vi.mock("@/shared/components/charts/BarChart", () => ({
  BarChart: () => <div data-testid="barchart-mock" />,
}));

describe("BankTransactionPartnerRightPanel", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const renderPanel = (tx: any) =>
    render(
      <QueryClientProvider client={queryClient}>
        <BankTransactionPartnerRightPanel transaction={tx} />
      </QueryClientProvider>,
    );

  it("renders THÔNG TIN CHUNG and Tổng quan Dòng tiền, but does NOT render old Hồ sơ đối tác section", () => {
    const mockTxn = {
      id: "txn-201",
      sourceType: "BANK",
      transDate: "2026-08-20T00:00:00.000Z",
      correspondentName: "Công ty Cổ phần Vận tải X",
      correspondentAccount: "0987654321",
      branch: { name: "Chi nhánh Lê Văn Lương" },
      bankAccount: {
        accountName: "TK BIDV Chính",
        accountNumber: "12345678",
      },
      postingStatus: "POSTED",
    };

    renderPanel(mockTxn);

    // Section 1: THÔNG TIN CHUNG
    expect(screen.getByText("THÔNG TIN CHUNG")).toBeTruthy();
    expect(screen.getByText("Công ty Cổ phần Vận tải X")).toBeTruthy();
    expect(screen.getByText("Chi nhánh Lê Văn Lương")).toBeTruthy();

    // Section 2: Tổng quan Dòng tiền
    expect(screen.getByText("Tổng quan Dòng tiền")).toBeTruthy();

    // Verify old "Hồ sơ đối tác" section is NOT rendered
    expect(screen.queryByText("Hồ sơ đối tác")).toBeNull();
  });
});
