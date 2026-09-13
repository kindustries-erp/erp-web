// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { ErpWarehouseTab } from "../ErpWarehouseTab";
import { encodeStateParam } from "@/shared/utils/pageUrl";
import api from "@/core/api/axiosInstance";

window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock("@/shared/components/PillTabs", () => ({
  PillTabs: ({
    value,
    onValueChange,
    items,
  }: {
    value: string;
    onValueChange: (val: string) => void;
    items: { value: string; label: React.ReactNode }[];
  }) => (
    <div data-testid="pill-tabs" data-value={value}>
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          data-state={value === item.value ? "active" : "inactive"}
          onClick={() => onValueChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

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

describe("ErpWarehouseTab 2-Way URL Sync Suite", () => {
  let queryClient: QueryClient;

  const mockVouchersResponse = {
    data: {
      items: [
        {
          id: "gr-1",
          voucherNo: "NK-2026090001",
          date: "2026-09-02",
          type: "receipt",
          status: "POSTED",
          partnerId: "p-1",
          partnerName: "Nhà cung cấp A",
          totalQty: 100,
          createdAt: "2026-09-02T10:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    (api.get as any).mockImplementation((url: string) => {
      if (url === "/api/v1/inventory/warehouse-vouchers") {
        return Promise.resolve(mockVouchersResponse);
      }
      if (url === "/api/v1/basic-masters") {
        return Promise.resolve({
          data: {
            items: [],
            meta: { total: 0, page: 1, limit: 50, totalPages: 1 },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it("renders 4 PillTabs (Tất cả, Nhập kho, Xuất kho, Điều chỉnh)", async () => {
    window.history.replaceState(null, "", "/erp-inventory-vouchers");

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ErpWarehouseTab />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByText("Tất cả")).toBeInTheDocument();
    expect(screen.getByText("Nhập kho")).toBeInTheDocument();
    expect(screen.getByText("Xuất kho")).toBeInTheDocument();
    expect(screen.getByText("Điều chỉnh")).toBeInTheDocument();
  });

  it("calls API with type=receipt and updates URL when clicking Nhập kho tab", async () => {
    window.history.replaceState(null, "", "/erp-inventory-vouchers");

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ErpWarehouseTab />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    const receiptTab = screen.getByText("Nhập kho");
    fireEvent.click(receiptTab);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/api/v1/inventory/warehouse-vouchers",
        expect.objectContaining({
          params: expect.objectContaining({
            type: "receipt",
          }),
        }),
      );
    });

    expect(window.location.search).toContain("tab=receipt");
  });

  it("hydrates activeTypeTab, dates, and pagination from URL on mount", async () => {
    const encodedCf = encodeStateParam({ status: ["POSTED"] });
    window.history.replaceState(
      null,
      "",
      `/erp-inventory-vouchers?tab=issue&dateFrom=2026-09-01&dateTo=2026-09-05&page=2&cf=${encodedCf}`,
    );

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ErpWarehouseTab />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/api/v1/inventory/warehouse-vouchers",
        expect.objectContaining({
          params: expect.objectContaining({
            type: "issue",
            page: 2,
            dateFrom: "2026-09-01",
            dateTo: "2026-09-05",
          }),
        }),
      );
    });
  });

  it("handles popstate event to restore tab from URL", async () => {
    window.history.replaceState(
      null,
      "",
      "/erp-inventory-vouchers?tab=receipt",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ErpWarehouseTab />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/api/v1/inventory/warehouse-vouchers",
        expect.objectContaining({
          params: expect.objectContaining({
            type: "receipt",
          }),
        }),
      );
    });

    // Simulate browser back/forward to ?tab=adjustment
    window.history.replaceState(
      null,
      "",
      "/erp-inventory-vouchers?tab=adjustment",
    );
    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/api/v1/inventory/warehouse-vouchers",
        expect.objectContaining({
          params: expect.objectContaining({
            type: "adjustment",
          }),
        }),
      );
    });
  });
});
