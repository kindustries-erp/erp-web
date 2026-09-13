// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { InventoryListPage } from "../components/InventoryListPage";
import { useOperationalListStore } from "../hooks/useOperationalListStore";
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

describe("InventoryStock 2-Way URL Sync Suite", () => {
  let queryClient: QueryClient;

  const mockStockResponse = {
    data: {
      items: [
        {
          inventory_item_id: "item-1",
          item_code: "SKU001",
          item_name: "Item 1",
          item_type: "RAW",
          unit: "Cái",
          received_qty: 10,
          issued_qty: 2,
          adjusted_qty: 0,
          on_hand_qty: 8,
          reserved_qty: 0,
          stock_value: 80000,
          status: "ACTIVE",
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

    useOperationalListStore.getState().resetAllFilters();

    (api.get as any).mockResolvedValue(mockStockResponse);
  });

  it("renders 4 PillTabs (Tất cả, Còn tồn kho, Hết hàng, Tồn âm)", async () => {
    window.history.replaceState(null, "", "/erp-inventory-stock");

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <InventoryListPage />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByText("Tất cả")).toBeInTheDocument();
    expect(screen.getByText("Còn tồn kho")).toBeInTheDocument();
    expect(screen.getByText("Hết hàng")).toBeInTheDocument();
    expect(screen.getByText("Tồn âm")).toBeInTheDocument();
  });

  it("changes stockTab in store and calls API with stock_tab query parameter when clicking a PillTab", async () => {
    window.history.replaceState(null, "", "/erp-inventory-stock");

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <InventoryListPage />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    const inStockTab = screen.getByText("Còn tồn kho");
    fireEvent.click(inStockTab);

    expect(useOperationalListStore.getState().stockTab).toBe("IN_STOCK");

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/api/v1/inventory/stock",
        expect.objectContaining({
          params: expect.objectContaining({
            stock_tab: "IN_STOCK",
          }),
        }),
      );
    });
  });

  it("hydrates stockTab, search, itemType, and pagination from URL on mount", async () => {
    const encodedCf = encodeStateParam({ item_type: ["RAW"] });
    window.history.replaceState(
      null,
      "",
      `/erp-inventory-stock?stock_tab=NEGATIVE&search=SKU001&itemType=RAW&page=2&cf=${encodedCf}`,
    );

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <InventoryListPage />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    expect(useOperationalListStore.getState().stockTab).toBe("NEGATIVE");
    expect(useOperationalListStore.getState().searchInput).toBe("SKU001");
    expect(useOperationalListStore.getState().itemTypeFilter).toBe("RAW");
    expect(useOperationalListStore.getState().page).toBe(2);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/api/v1/inventory/stock",
        expect.objectContaining({
          params: expect.objectContaining({
            stock_tab: "NEGATIVE",
            page: 2,
            item_type: "RAW",
          }),
        }),
      );
    });
  });

  it("handles popstate event to restore filters from URL", async () => {
    window.history.replaceState(
      null,
      "",
      "/erp-inventory-stock?stock_tab=IN_STOCK",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <InventoryListPage />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    expect(useOperationalListStore.getState().stockTab).toBe("IN_STOCK");

    // Simulate browser back/forward to ?stock_tab=OUT_OF_STOCK&search=VF5
    window.history.replaceState(
      null,
      "",
      "/erp-inventory-stock?stock_tab=OUT_OF_STOCK&search=VF5",
    );
    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitFor(() => {
      expect(useOperationalListStore.getState().stockTab).toBe("OUT_OF_STOCK");
      expect(useOperationalListStore.getState().searchInput).toBe("VF5");
    });
  });
});
