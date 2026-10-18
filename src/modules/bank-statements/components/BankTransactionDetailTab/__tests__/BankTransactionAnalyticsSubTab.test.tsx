// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BankTransactionAnalyticsSubTab } from "../BankTransactionAnalyticsSubTab";

vi.mock("@/modules/bank-statements/api/bankStatementApi", () => ({
  bankStatementApi: {
    getDashboardStats: vi.fn().mockResolvedValue({
      totalCashIn: 50000000,
      totalCashOut: 20000000,
      netCashFlow: 30000000,
      cashTrend: [
        {
          label: "2026-08",
          cashIn: 30000000,
          cashOut: 10000000,
        },
        {
          label: "2026-09",
          cashIn: 20000000,
          cashOut: 10000000,
        },
      ],
    }),
    getTransactions: vi.fn().mockResolvedValue({
      items: [],
      total: 12,
      totalPages: 1,
    }),
  },
}));

vi.mock("@/shared/components/charts/BarChart", () => ({
  BarChart: () => <div data-testid="mock-bar-chart">Mock BarChart</div>,
}));

describe("BankTransactionAnalyticsSubTab", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const renderComponent = (props: any) =>
    render(
      <QueryClientProvider client={queryClient}>
        <BankTransactionAnalyticsSubTab {...props} />
      </QueryClientProvider>,
    );

  it("renders 4 KPI cards, BarChart and StandardTable when partner info exists", async () => {
    const mockTxn = {
      id: "txn-1",
      correspondentName: "Công ty TNHH Liouni",
      correspondentAccount: "111886888",
    };

    renderComponent({ transaction: mockTxn });

    // 1. KPI cards
    expect(screen.getAllByText(/Tổng thu/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tổng chi/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Chênh lệch Ròng/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tổng số GD đã lưu/i).length).toBeGreaterThan(0);

    // 2. BarChart & Table Headers
    expect(screen.getByText(/Biểu đồ biến động theo tháng/i)).toBeTruthy();
    expect(screen.getByText(/Bảng kê biến động theo kỳ/i)).toBeTruthy();

    // 3. Async resolved: BarChart & Table Rows
    await waitFor(() => {
      expect(screen.getByTestId("mock-bar-chart")).toBeTruthy();
      expect(screen.getByText("2026-08")).toBeTruthy();
      expect(screen.getByText("2026-09")).toBeTruthy();
    });
  });

  it("renders empty state when transaction has no partner name and account", () => {
    const mockTxn = {
      id: "txn-no-partner",
      correspondentName: "",
      correspondentAccount: "",
    };

    renderComponent({ transaction: mockTxn });

    expect(
      screen.getByText(/Giao dịch này chưa có tên hoặc số tài khoản đối tác/i),
    ).toBeTruthy();
  });
});
