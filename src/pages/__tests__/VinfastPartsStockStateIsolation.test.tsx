// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { VinfastPartsStockPage } from "../VinfastPartsStockPage";
import { useVinfastPartsStockStore } from "../hooks/useVinfastPartsStockStore";
import { useTableColumnStore } from "@/shared/hooks/useTableColumnState";
import api from "@/core/api/axiosInstance";

// Mock ResizeObserver for Tabs and DataTable
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

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, def?: string) => {
      if (key === "nav:items.vinfastPartsDashboard") return "Tổng quan";
      if (key === "nav:items.vinfastPartsOtoStock") return "Phụ tùng ôtô";
      if (key === "nav:items.vinfastPartsXemayStock") return "Phụ tùng xe máy";
      if (key === "vinfastParts:ALL") return "Tất cả";
      if (key === "vinfastParts:IN_STOCK") return "Còn tồn kho";
      if (key === "vinfastParts:OUT_OF_STOCK") return "Hết hàng";
      if (key === "vinfastParts:NEGATIVE_STOCK") return "Tồn âm";
      return def || key;
    },
  }),
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

describe("VinfastPartsStockStateIsolation & PillTabs Suite", () => {
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
    ],
    total: 1,
    totalPages: 1,
    page: 1,
    limit: 50,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
    useVinfastPartsStockStore.getState().resetTabState("oto");
    useVinfastPartsStockStore.getState().resetTabState("xemay");
    useTableColumnStore.getState().resetFilters("vinfast-parts-stock-oto");
    useTableColumnStore.getState().resetFilters("vinfast-parts-stock-xemay");

    vi.mocked(api.get).mockResolvedValue({ data: mockStockData });
  });

  it("maintains isolated state between 'oto' and 'xemay' in useVinfastPartsStockStore", () => {
    const store = useVinfastPartsStockStore.getState();

    // Update oto tab
    store.setStockTab("oto", "IN_STOCK");
    store.setSearch("oto", "loc gio");
    store.setPage("oto", 3);

    // Update xemay tab
    store.setStockTab("xemay", "OUT_OF_STOCK");
    store.setPage("xemay", 2);

    const states = useVinfastPartsStockStore.getState().states;

    expect(states.oto.stockTab).toBe("IN_STOCK");
    expect(states.oto.page).toBe(3);
    expect(states.oto.search).toBe("loc gio");

    expect(states.xemay.stockTab).toBe("OUT_OF_STOCK");
    expect(states.xemay.page).toBe(2);
    expect(states.xemay.search).toBe("");
  });

  it("resets page to 1 when changing stockTab (PillTab) without affecting columnFilters/columnSearch", () => {
    // Setup initial table column filters
    useTableColumnStore
      .getState()
      .setColumnFilter("vinfast-parts-stock-oto", "name", ["Lọc gió"]);
    useTableColumnStore
      .getState()
      .setColumnSearch("vinfast-parts-stock-oto", "sku", "VF5");

    const store = useVinfastPartsStockStore.getState();
    store.setPage("oto", 5);

    // Switch PillTab to 'OUT_OF_STOCK'
    store.setStockTab("oto", "OUT_OF_STOCK");

    const otoState = useVinfastPartsStockStore.getState().states.oto;
    expect(otoState.stockTab).toBe("OUT_OF_STOCK");
    expect(otoState.page).toBe(1); // Reset page to 1

    // Verify columnFilters and columnSearch are completely untouched
    const otoTable =
      useTableColumnStore.getState().tables["vinfast-parts-stock-oto"];
    expect(otoTable.columnFilters["name"]).toEqual(["Lọc gió"]);
    expect(otoTable.columnSearch["sku"]).toBe("VF5");
  });

  it("hydrates stockTab, page, and selectedSku from URL", () => {
    useVinfastPartsStockStore.getState().hydrateFromUrl("oto", {
      stockTab: "IN_STOCK",
      page: 4,
      selectedSku: "VF-VF8-002",
    });

    const otoState = useVinfastPartsStockStore.getState().states.oto;
    expect(otoState.stockTab).toBe("IN_STOCK");
    expect(otoState.page).toBe(4);
    expect(otoState.selectedSku).toBe("VF-VF8-002");
  });

  it("renders 4 PillTabs (Tất cả, Còn tồn kho, Hết hàng, Tồn âm) and sends stockTab query parameter to API", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <VinfastPartsStockPage initialTab="oto" />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    // Initially fetches with vehicleType=oto
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("vehicleType=oto"),
      );
    });

    // Check 4 PillTabs exist
    expect(screen.getByRole("tab", { name: "Tất cả" })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Còn tồn kho" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Hết hàng" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tồn âm" })).toBeInTheDocument();

    // Click 'Còn tồn kho' PillTab
    fireEvent.click(screen.getByRole("tab", { name: "Còn tồn kho" }));

    await waitFor(() => {
      expect(useVinfastPartsStockStore.getState().states.oto.stockTab).toBe(
        "IN_STOCK",
      );
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("stock_tab=IN_STOCK"),
      );
    });

    // Click 'Hết hàng' PillTab
    fireEvent.click(screen.getByRole("tab", { name: "Hết hàng" }));

    await waitFor(() => {
      expect(useVinfastPartsStockStore.getState().states.oto.stockTab).toBe(
        "OUT_OF_STOCK",
      );
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("stock_tab=OUT_OF_STOCK"),
      );
    });

    // Click 'Tồn âm' PillTab
    fireEvent.click(screen.getByRole("tab", { name: "Tồn âm" }));

    await waitFor(() => {
      expect(useVinfastPartsStockStore.getState().states.oto.stockTab).toBe(
        "NEGATIVE",
      );
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("stock_tab=NEGATIVE"),
      );
    });
  });
});
