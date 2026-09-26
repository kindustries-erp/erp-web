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
    getColumnOptions: vi.fn().mockResolvedValue([]),
  },
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

  it("renders Sub-Tabs PillTabs with 1. Chi tiết and 2. Chi tiết theo đối tượng", async () => {
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
});
