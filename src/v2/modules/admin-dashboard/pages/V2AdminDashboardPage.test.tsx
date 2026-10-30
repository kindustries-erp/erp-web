import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2AdminDashboardPage } from "./V2AdminDashboardPage";

vi.mock("../api/adminDashboardApi", () => ({
  adminDashboardApi: {
    getSummary: vi.fn().mockResolvedValue({
      kpis: {
        revenue: { value: 1500000000, growthRate: 12.5 },
        salesOrdersCount: { value: 142, pendingCount: 18 },
        inventoryLowStockCount: { value: 7 },
        unpaidReceivables: { value: 320000000 },
      },
      recentPendingApprovals: [],
      systemHealth: {
        activeUsers: 24,
        lastSyncAt: "2026-10-30T05:30:00.000Z",
      },
    }),
  },
}));

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_k: string, fallback: string) => fallback,
    locale: "vi",
  }),
}));

describe("V2AdminDashboardPage Platform Split", () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it("renders Desktop layout when innerWidth >= 1024", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });

    render(<V2AdminDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId("admin-dashboard-desktop")).toBeDefined();
    expect(screen.getByText("Cổng Điều Hành Doanh Nghiệp")).toBeDefined();
  });

  it("renders Mobile layout when innerWidth < 768", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 390,
    });

    render(<V2AdminDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId("admin-dashboard-mobile")).toBeDefined();
    expect(screen.getByText("Cổng Quản Trị")).toBeDefined();
  });
});
