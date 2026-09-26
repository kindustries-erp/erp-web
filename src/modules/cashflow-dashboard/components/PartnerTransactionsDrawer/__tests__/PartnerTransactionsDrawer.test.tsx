// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { PartnerTransactionsDrawer } from "../PartnerTransactionsDrawer";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";

window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock("@/modules/bank-statements/api/bankStatementApi", () => ({
  bankStatementApi: {
    getTransactions: vi.fn().mockResolvedValue({
      items: [
        {
          id: "txn-1",
          transDate: "2026-09-18T00:00:00.000Z",
          referenceNumber: "FT26001",
          description: "Khach hang chuyen khoan",
          creditAmount: 50000000,
          debitAmount: 0,
          netOffAmount: 30000000,
          balance: 100000000,
          correspondentName: "NGUYEN NGOC HUY",
          correspondentAccount: "1110077808",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    }),
    getDashboardStats: vi.fn().mockResolvedValue({
      totalCashIn: 50000000,
      totalCashOut: 0,
      netCashFlow: 50000000,
      cashTrend: [{ label: "2026-09", cashIn: 50000000, cashOut: 0 }],
      sourceBreakdown: [],
    }),
    getColumnOptions: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      totalPages: 1,
    }),
  },
}));

vi.mock("@/core/config/appStore", () => {
  const store = {
    locale: "vi",
    openCustomFieldsDrawer: vi.fn(),
  };
  const useAppStore = vi.fn((selector?: any) =>
    selector ? selector(store) : store,
  );
  (useAppStore as any).getState = () => store;
  return { useAppStore };
});

describe("PartnerTransactionsDrawer", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("renders partner drawer without crashing on column header render", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <PartnerTransactionsDrawer
            open={true}
            onClose={vi.fn()}
            correspondentName="NGUYEN NGOC HUY"
            correspondentAccount="1110077808"
          />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    // Title includes partner display name
    expect(screen.getByText(/NGUYEN NGOC HUY/i)).toBeDefined();

    // Verify transactions API is called
    await waitFor(() => {
      expect(bankStatementApi.getTransactions).toHaveBeenCalled();
    });
  });
});
