// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BankTransactionDetailTab } from "../BankTransactionDetailTab";

vi.mock("@/modules/bank-statements/api/bankStatementApi", () => ({
  bankStatementApi: {
    getTransactions: vi.fn().mockResolvedValue({
      items: [
        {
          id: "partner-txn-1",
          transDate: "2026-08-01T00:00:00.000Z",
          referenceNumber: "REF-P1",
          description: "Giao dịch đối tác 1",
          creditAmount: 5000000,
          debitAmount: 0,
          netOffAmount: 0,
        },
      ],
      total: 1,
      totalPages: 1,
    }),
    getDashboardStats: vi.fn().mockResolvedValue({
      totalCashIn: 5000000,
      totalCashOut: 0,
      netCashFlow: 5000000,
      cashTrend: [
        {
          label: "2026-08",
          cashIn: 5000000,
          cashOut: 0,
        },
      ],
    }),
    getColumnOptions: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/shared/components/charts/BarChart", () => ({
  BarChart: () => <div data-testid="mock-bar-chart">Mock BarChart</div>,
}));

describe("BankTransactionDetailTab", () => {
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
        <BankTransactionDetailTab {...props} />
      </QueryClientProvider>,
    );

  it("renders Sub-Tabs PillTabs with 1. Chi tiết, 2. Chi tiết theo đối tượng and 3. Biến động", async () => {
    const mockTxn = {
      id: "txn-1",
      sourceType: "BANK",
      transDate: "2026-08-01T00:00:00.000Z",
      referenceNumber: "REF-001",
      description: "Thanh toan tien",
      creditAmount: 1000000,
      debitAmount: 0,
      bankAccount: { bankName: "BIDV", accountNumber: "123456" },
      correspondentName: "Đối tác Công ty ABC",
      correspondentAccount: "987654321",
    };

    renderComponent({
      transaction: mockTxn,
      defaultViewMode: "details",
    });

    // Sub-tab 1: Chi tiết
    expect(screen.getByText("1. Chi tiết")).toBeTruthy();
    // Sub-tab 2: Chi tiết theo đối tượng
    expect(screen.getByText("2. Chi tiết theo đối tượng")).toBeTruthy();
    // Sub-tab 3: Biến động
    expect(screen.getByText("3. Biến động")).toBeTruthy();

    // Default view mode renders Voucher Preview Card
    expect(screen.getByText("Xem trước chứng từ")).toBeTruthy();
    expect(screen.getByText("BIDV")).toBeTruthy();
  });

  it("switches to partner sub-tab when clicked and shows partner table", async () => {
    const mockTxn = {
      id: "txn-1",
      sourceType: "BANK",
      transDate: "2026-08-01T00:00:00.000Z",
      referenceNumber: "REF-001",
      description: "Thanh toan tien",
      creditAmount: 1000000,
      debitAmount: 0,
      correspondentName: "Đối tác Công ty ABC",
      correspondentAccount: "987654321",
    };

    const handleViewModeChange = vi.fn();

    renderComponent({
      transaction: mockTxn,
      defaultViewMode: "details",
      onViewModeChange: handleViewModeChange,
    });

    // Click sub-tab 2
    fireEvent.click(screen.getByText("2. Chi tiết theo đối tượng"));

    await waitFor(() => {
      expect(screen.getByText("Giao dịch liên quan đối tác")).toBeTruthy();
      expect(screen.getByText("Giao dịch đối tác 1")).toBeTruthy();
    });

    expect(handleViewModeChange).toHaveBeenCalledWith("partner");
  });

  it("switches to analytics sub-tab when clicked and shows analytics charts and KPIs", async () => {
    const mockTxn = {
      id: "txn-1",
      sourceType: "BANK",
      transDate: "2026-08-01T00:00:00.000Z",
      referenceNumber: "REF-001",
      description: "Thanh toan tien",
      creditAmount: 1000000,
      debitAmount: 0,
      correspondentName: "Đối tác Công ty ABC",
      correspondentAccount: "987654321",
    };

    const handleViewModeChange = vi.fn();

    renderComponent({
      transaction: mockTxn,
      defaultViewMode: "details",
      onViewModeChange: handleViewModeChange,
    });

    // Click sub-tab 3
    fireEvent.click(screen.getByText("3. Biến động"));

    await waitFor(() => {
      expect(screen.getByText("Biểu đồ biến động theo tháng")).toBeTruthy();
      expect(screen.getByText("Bảng kê biến động theo kỳ")).toBeTruthy();
    });

    expect(handleViewModeChange).toHaveBeenCalledWith("analytics");
  });
});
