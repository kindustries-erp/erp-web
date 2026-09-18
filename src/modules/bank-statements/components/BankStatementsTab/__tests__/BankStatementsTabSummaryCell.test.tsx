// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { BankStatementsTab } from "../BankStatementsTab";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";

window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock("@/modules/bank-statements/api/bankStatementApi", () => ({
  bankStatementApi: {
    getTransactions: vi.fn(),
    getColumnOptions: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      totalPages: 1,
    }),
    getBankAccounts: vi.fn().mockResolvedValue([]),
    getCashBooks: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/modules/branches/api/branchApi", () => ({
  getBranchesApi: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/modules/tags/api/tagsApi", () => ({
  getTags: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/core/config/appStore", () => {
  const store = {
    locale: "vi",
    openCustomFieldsDrawer: vi.fn(),
  };
  const useAppStore = vi.fn(() => store);
  (useAppStore as any).getState = () => store;
  return { useAppStore };
});

const mockTransactions = [
  {
    id: "txn-1",
    transDate: "2026-09-18T00:00:00.000Z",
    referenceNumber: "FT26001",
    description: "Khach hang chuyen khoan tien coc",
    creditAmount: 50000000,
    debitAmount: 0,
    netOffAmount: 30000000,
    balance: 100000000,
  },
  {
    id: "txn-2",
    transDate: "2026-09-18T00:00:00.000Z",
    referenceNumber: "FT26002",
    description: "Thanh toan tien nha cung cap",
    creditAmount: 0,
    debitAmount: 20000000,
    netOffAmount: 20000000,
    balance: 80000000,
  },
];

describe("BankStatementsTab SubtotalSummaryCell Suite", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    (bankStatementApi.getTransactions as any).mockResolvedValue({
      items: mockTransactions,
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
  });

  it("renders SubtotalSummaryCell in BankStatementsTab summaryRow and opens popover on click", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BankStatementsTab type="bank" />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    // Wait for transactions to load
    await waitFor(() => {
      expect(screen.getByText("FT26001")).toBeInTheDocument();
    });

    // Check summary cell values rendered (money formatted)
    const elementsThu = screen.getAllByText((content) =>
      content.includes("50.000.000"),
    );
    expect(elementsThu.length).toBeGreaterThanOrEqual(2);

    const elementsChi = screen.getAllByText((content) =>
      content.includes("20.000.000"),
    );
    expect(elementsChi.length).toBeGreaterThanOrEqual(2);

    // Click trigger on Thu amount in summary row
    const summaryThuTrigger = elementsThu[elementsThu.length - 1];
    fireEvent.click(summaryThuTrigger);

    // Popover content should be visible
    await waitFor(() => {
      expect(screen.getByText("Tổng quan số liệu")).toBeInTheDocument();
    });
  });
});
