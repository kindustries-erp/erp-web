// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import {
  VinfastPartsStockPage,
  type VinfastPartsStockTab,
} from "../VinfastPartsStockPage";
import api from "@/core/api/axiosInstance";

// Mock ResizeObserver for Tabs and DataTable
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock UI Tabs for reliable jsdom tab interaction
vi.mock("@/shared/components/ui/tabs", () => ({
  Tabs: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (val: string) => void;
  }) => (
    <div data-testid="tabs" data-value={value}>
      {Array.isArray(children)
        ? children.map((child: any) =>
            child
              ? {
                  ...child,
                  props: {
                    ...child.props,
                    activeValue: value,
                    onSelect: onValueChange,
                  },
                }
              : child,
          )
        : children && typeof children === "object"
          ? {
              ...(children as any),
              props: {
                ...(children as any).props,
                activeValue: value,
                onSelect: onValueChange,
              },
            }
          : children}
    </div>
  ),
  TabsList: ({
    children,
    activeValue,
    onSelect,
  }: {
    children: React.ReactNode;
    activeValue?: string;
    onSelect?: (val: string) => void;
  }) => (
    <div role="tablist">
      {Array.isArray(children)
        ? children.map((child: any) =>
            child
              ? {
                  ...child,
                  props: { ...child.props, activeValue, onSelect },
                }
              : child,
          )
        : children}
    </div>
  ),
  TabsTrigger: ({
    children,
    value,
    activeValue,
    onSelect,
  }: {
    children: React.ReactNode;
    value: string;
    activeValue?: string;
    onSelect?: (val: string) => void;
  }) => (
    <button
      role="tab"
      data-state={activeValue === value ? "active" : "inactive"}
      onClick={() => onSelect?.(value)}
    >
      {children}
    </button>
  ),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, def?: string) => {
      if (key === "nav:items.vinfastPartsDashboard") return "Tổng quan";
      if (key === "nav:items.vinfastPartsOtoStock") return "Phụ tùng ôtô";
      if (key === "nav:items.vinfastPartsXemayStock") return "Phụ tùng xe máy";
      return def || key;
    },
  }),
}));

vi.mock("@/shared/components/KpiSparkline", () => ({
  KpiSparkline: () => <div data-testid="kpi-sparkline" />,
}));

vi.mock("@/shared/components/charts/BarChart", () => ({
  BarChart: () => <div data-testid="bar-chart" />,
}));

vi.mock("@/pages/hooks/useVinfastPartsStockExportProgress", () => ({
  useVinfastPartsStockExportProgress: () => ({
    downloadReadyFile: vi.fn(),
  }),
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

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => ({
    setCustomBreadcrumbs: vi.fn(),
    locale: "vi",
  }),
}));

describe("VinfastPartsStockPage", () => {
  let queryClient: QueryClient;

  const mockStockData = {
    data: [
      {
        sku: "VF-VF5-001",
        name: "Lọc gió điều hòa VF5",
        uom: "Cái",
        qtyIn: 100,
        qtyOut: 40,
        qtyBalance: 60,
      },
      {
        sku: "VF-VF8-002",
        name: "Má phanh trước VF8",
        uom: "Bộ",
        qtyIn: 50,
        qtyOut: 10,
        qtyBalance: 40,
      },
    ],
    total: 2,
    totalPages: 1,
    page: 1,
    limit: 50,
  };

  const mockDashboardData = {
    summary: {
      revenue: 500000000,
      cogs: 350000000,
      grossProfit: 150000000,
      inventoryValue: 200000000,
      byVehicleType: {
        CAR: {
          revenue: 300000000,
          cogs: 200000000,
          grossProfit: 100000000,
          inventoryValue: 120000000,
        },
        MOTORBIKE: {
          revenue: 200000000,
          cogs: 150000000,
          grossProfit: 50000000,
          inventoryValue: 80000000,
        },
      },
    },
    charts: {
      revenue: [10, 20, 30],
      cogs: [5, 15, 25],
      grossProfit: [5, 5, 5],
      inventoryValue: [100, 100, 100],
    },
    trend: [],
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.includes("/api/v1/reports/vinfast-parts-dashboard")) {
        return Promise.resolve({ data: mockDashboardData });
      }
      return Promise.resolve({ data: mockStockData });
    });
  });

  const renderComponent = (initialTab?: VinfastPartsStockTab) =>
    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <VinfastPartsStockPage initialTab={initialTab} />
        </TooltipProvider>
      </QueryClientProvider>,
    );

  it("renders 3 header tabs: Tổng quan (mặc định), Phụ tùng ôtô, Phụ tùng xe máy", async () => {
    renderComponent();

    // Check all 3 tabs exist
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBe(3);
    expect(screen.getByRole("tab", { name: /tổng quan/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /phụ tùng ôtô/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /phụ tùng xe máy/i }),
    ).toBeInTheDocument();

    // By default, dashboard tab is active and loads dashboard data
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/reports/vinfast-parts-dashboard"),
      );
    });
  });

  it("switches from dashboard to oto tab when clicked and fetches car stock data", async () => {
    renderComponent();

    const otoTab = screen.getByRole("tab", { name: /phụ tùng ôtô/i });
    fireEvent.click(otoTab);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("vehicleType=oto"),
      );
    });
  });

  it("switches from dashboard to xemay tab when clicked and fetches motorbike stock data", async () => {
    renderComponent();

    const xemayTab = screen.getByRole("tab", { name: /phụ tùng xe máy/i });
    fireEvent.click(xemayTab);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("vehicleType=xemay"),
      );
    });
  });

  it("initializes directly with initialTab='oto' when specified", async () => {
    renderComponent("oto");

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("vehicleType=oto"),
      );
      expect(screen.getByText("VF-VF5-001")).toBeInTheDocument();
    });
  });
});
