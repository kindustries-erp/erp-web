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
    getTransactions: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    }),
    getDashboardStats: vi.fn().mockResolvedValue({
      totalCashIn: 100000000,
      totalCashOut: 50000000,
      netCashFlow: 50000000,
      cashTrend: [],
      sourceBreakdown: [],
    }),
    getPartnerStats: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    }),
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
    updateCurrentTabUrl: vi.fn(),
  };
  const useAppStore = vi.fn(() => store);
  (useAppStore as any).getState = () => store;
  return { useAppStore };
});

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: (selector?: any) => {
    const state = {
      employee: { email: "admin@liouni.com" },
      effectivePermissions: [],
    };
    return selector ? selector(state) : state;
  },
}));

describe("BankStatementsTab Unified Multi-Tab Coordinator", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    // Reset window.location
    window.history.replaceState(null, "", "/bank-statement");
  });

  it("defaults to dashboard tab and renders tab navigation", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BankStatementsTab />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    // Verify all 3 top tabs are rendered
    expect(
      screen.getAllByRole("tab", { name: /Tổng quan dòng tiền/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("tab", { name: /Sao kê ngân hàng/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("tab", { name: /Sổ quỹ tiền mặt/i }).length,
    ).toBeGreaterThan(0);
  });

  it("respects initialTab prop when set to bank", async () => {
    window.history.replaceState(null, "", "/bank-statement?tab=bank");
    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BankStatementsTab initialTab="bank" />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(bankStatementApi.getTransactions).toHaveBeenCalled();
    });
  });

  it("switches tabs and keeps views mounted (Keep-Alive)", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BankStatementsTab initialTab="dashboard" />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    // Find tab triggers
    const bankTabs = screen.getAllByRole("tab", { name: /Sao kê ngân hàng/i });
    fireEvent.pointerDown(bankTabs[0], { button: 0, ctrlKey: false });
    fireEvent.click(bankTabs[0]);
    fireEvent.keyDown(bankTabs[0], { key: "Enter", code: "Enter" });

    // Should call transactions API after switching to bank tab
    await waitFor(
      () => {
        expect(bankStatementApi.getTransactions).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    // Check URL updated with tab=bank
    expect(window.location.search).toContain("tab=bank");
  });
});
