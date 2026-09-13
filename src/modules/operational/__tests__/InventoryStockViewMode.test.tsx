// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { InventoryListPage } from "../components/InventoryListPage";
import { useOperationalListStore } from "../hooks/useOperationalListStore";
import { useUserPreferencesStore } from "@/shared/hooks/useUserPreferences";
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

describe("InventoryStock View Mode Suite", () => {
  let queryClient: QueryClient;

  const mockStockResponse = {
    data: {
      items: [
        {
          id: "item-1",
          item_code: "RAW-001",
          item_name: "Thép tấm",
          on_hand_qty: 50,
          received_qty: 100,
          issued_qty: 50,
          unit: "KG",
          item_type: "RAW",
        },
      ],
      total: 1,
      page: 1,
      limit: 25,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/operational/inventory");
    localStorage.clear();
    useOperationalListStore.getState().resetAllFilters();
    useUserPreferencesStore.setState({ tables: {} });

    (api.get as any).mockImplementation((url: string) => {
      if (
        url.includes("/api/v1/operational/inventory-stock") ||
        url.includes("/inventory/stock")
      ) {
        return Promise.resolve(mockStockResponse);
      }
      if (url.includes("basic-masters")) {
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

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <InventoryListPage />
        </TooltipProvider>
      </QueryClientProvider>,
    );
  };

  it("renders ViewModeCombobox with default Tổng quan view", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Tổng quan")).toBeInTheDocument();
    });
  });

  it("changes view mode to audit when selected", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Tổng quan")).toBeInTheDocument();
    });

    const trigger = screen.getByRole("button", { name: /Tổng quan/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Đối soát")).toBeInTheDocument();
    });

    const auditOption = screen.getByText("Đối soát");
    fireEvent.click(auditOption);

    await waitFor(() => {
      const pref = useUserPreferencesStore
        .getState()
        .getTablePreference("inventory-stock-table");
      expect(pref?.activeView).toBe("audit");
      expect(pref?.columnVisibility?.last).toBe(true);
    });
  });

  it("hydrates active view mode from URL on mount", async () => {
    window.history.replaceState(
      null,
      "",
      "/operational/inventory?view_mode=audit",
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Đối soát")).toBeInTheDocument();
    });
  });

  it("handles popstate to restore view_mode from URL", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Tổng quan")).toBeInTheDocument();
    });

    window.history.replaceState(
      null,
      "",
      "/operational/inventory?view_mode=audit",
    );
    fireEvent(window, new PopStateEvent("popstate"));

    await waitFor(() => {
      expect(screen.getByText("Đối soát")).toBeInTheDocument();
    });
  });
});
