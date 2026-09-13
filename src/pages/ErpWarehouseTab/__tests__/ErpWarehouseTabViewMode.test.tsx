// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { ErpWarehouseTab } from "../ErpWarehouseTab";
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

describe("ErpWarehouseTab View Mode Suite", () => {
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
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/warehouse");
    localStorage.clear();
    useUserPreferencesStore.setState({ tables: {} });

    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("warehouse-vouchers")) {
        return Promise.resolve(mockVouchersResponse);
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
          <ErpWarehouseTab />
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
        .getTablePreference("inventory-vouchers-table");
      expect(pref?.activeView).toBe("audit");
      expect(pref?.columnVisibility?.remarks).toBe(true);
    });
  });

  it("hydrates active view mode from URL on mount", async () => {
    window.history.replaceState(null, "", "/warehouse?view_mode=audit");

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

    window.history.replaceState(null, "", "/warehouse?view_mode=audit");
    fireEvent(window, new PopStateEvent("popstate"));

    await waitFor(() => {
      expect(screen.getByText("Đối soát")).toBeInTheDocument();
    });
  });
});
