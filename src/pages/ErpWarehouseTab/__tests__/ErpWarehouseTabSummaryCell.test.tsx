// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { ErpWarehouseTab } from "../ErpWarehouseTab";
import api from "@/core/api/axiosInstance";

window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock("@/core/api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: () => true,
}));

vi.mock("@/core/config/appStore", () => {
  const store = {
    setCustomBreadcrumbs: vi.fn(),
    updateCurrentTabUrl: vi.fn(),
    locale: "vi",
  };
  const useAppStore = vi.fn(() => store);
  (useAppStore as any).getState = () => store;
  return { useAppStore };
});

const mockVouchers = [
  {
    id: "rec-1",
    type: "receipt",
    voucherNo: "NK-20260918-001",
    date: "2026-09-18",
    createdAt: "2026-09-18T00:00:00.000Z",
    status: "COMPLETED",
    totalQty: 150,
  },
  {
    id: "iss-1",
    type: "issue",
    voucherNo: "XK-20260918-001",
    date: "2026-09-18",
    createdAt: "2026-09-18T00:00:00.000Z",
    status: "COMPLETED",
    totalQty: 40,
  },
  {
    id: "adj-1",
    type: "adjustment",
    voucherNo: "DC-20260918-001",
    date: "2026-09-18",
    createdAt: "2026-09-18T00:00:00.000Z",
    status: "COMPLETED",
    totalQty: 10,
  },
];

describe("ErpWarehouseTab SubtotalSummaryCell Suite", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    });

    (api.get as any).mockImplementation((url: string) => {
      if (url === "/api/v1/inventory/warehouse-vouchers") {
        return Promise.resolve({
          data: {
            items: mockVouchers,
            total: 3,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          },
        });
      }
      if (url.includes("basic-masters")) {
        return Promise.resolve({
          data: {
            items: [],
            meta: { total: 0, page: 1, limit: 50, totalPages: 1 },
          },
        });
      }
      if (url.includes("company-profile") || url.includes("companyProfile")) {
        return Promise.resolve({
          data: { name: "Test Corp" },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it("renders SubtotalSummaryCell triggers in summaryRow and opens popover on click", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ErpWarehouseTab />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    // Wait for table to load
    await waitFor(() => {
      expect(screen.getByText("NK-20260918-001")).toBeInTheDocument();
    });

    // Verify summary values rendered via SubtotalSummaryCell (both in row and in summary row)
    const elements150 = screen.getAllByText("150");
    expect(elements150.length).toBeGreaterThanOrEqual(2);

    const elements40 = screen.getAllByText("40");
    expect(elements40.length).toBeGreaterThanOrEqual(2);

    const elements10 = screen.getAllByText("+10");
    expect(elements10.length).toBeGreaterThanOrEqual(2);

    // Click trigger on receipt qty in summary row to open popover
    const summaryTrigger = elements150[elements150.length - 1];
    fireEvent.click(summaryTrigger);

    // Popover content should be visible
    await waitFor(() => {
      expect(screen.getAllByText(/SL Nhập/).length).toBeGreaterThanOrEqual(1);
    });
  });
});
