import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { TrackedGoodsPage } from "../TrackedGoodsPage";

// Mock ResizeObserver
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
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              activeValue: value,
              onSelect: onValueChange,
            } as any)
          : child,
      )}
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
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              activeValue,
              onSelect,
            } as any)
          : child,
      )}
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
      aria-selected={activeValue === value}
      onClick={() => onSelect?.(value)}
    >
      {children}
    </button>
  ),
}));

// Mock API
vi.mock("@/modules/inventory-core/api/inventoryCoreApi", () => ({
  inventoryCoreApi: {
    listSerials: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
      totalPages: 0,
    }),
    getSerialColumnOptions: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      next: null,
    }),
  },
}));

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: () => true,
}));

let mockColumnFilters: Record<string, Record<string, any>> = {};
let mockColumnSearch: Record<string, Record<string, any>> = {};

vi.mock("@/shared/hooks/useTableColumnState", () => ({
  useTableColumnState: (tableId: string) => {
    const filters = mockColumnFilters[tableId] || {};
    const search = mockColumnSearch[tableId] || {};
    return {
      tableId,
      sorts: [],
      columnFilters: filters,
      columnSearch: search,
      columnVisibility: {},
      columnOrder: [],
      columnSizing: {},
      pinnedColumns: [],
      activeFilterCount:
        Object.keys(filters).length + Object.keys(search).length,
      setSort: vi.fn(),
      setColumnFilter: vi.fn(),
      setColumnSearch: vi.fn(),
      resetFilters: vi.fn(),
      resetToDefaults: vi.fn(),
    };
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  );
};

describe("TrackedGoodsPage Header Page Tabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockColumnFilters = {};
    mockColumnSearch = {};
    window.history.replaceState(null, "", "/inventory/tracking");
  });

  it("renders 3 Header Page Tabs by default with parts tab active", () => {
    render(<TrackedGoodsPage />, { wrapper: createWrapper() });

    const partsTab = screen.getByRole("tab", { name: /Phụ tùng \/ Serial/i });
    const lotTab = screen.getByRole("tab", { name: /Lô \(Lot\)/i });
    const customTab = screen.getByRole("tab", {
      name: /Tùy chỉnh \(Custom\)/i,
    });

    expect(partsTab).toBeInTheDocument();
    expect(lotTab).toBeInTheDocument();
    expect(customTab).toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /Xe \/ Thành phẩm/i }),
    ).not.toBeInTheDocument();

    expect(partsTab).toHaveAttribute("data-state", "active");
  });

  it("initializes active tab from URL query param ?tab=lot", () => {
    window.history.replaceState(null, "", "/inventory/tracking?tab=lot");
    render(<TrackedGoodsPage />, { wrapper: createWrapper() });

    const lotTab = screen.getByRole("tab", { name: /Lô \(Lot\)/i });
    expect(lotTab).toHaveAttribute("data-state", "active");
  });

  it("initializes active tab from initialTab prop (e.g. lot)", () => {
    render(<TrackedGoodsPage initialTab="lot" />, { wrapper: createWrapper() });

    const lotTab = screen.getByRole("tab", { name: /Lô \(Lot\)/i });
    expect(lotTab).toHaveAttribute("data-state", "active");
  });

  it("switches tab on click and updates URL search params", () => {
    render(<TrackedGoodsPage />, { wrapper: createWrapper() });

    const customTab = screen.getByRole("tab", {
      name: /Tùy chỉnh \(Custom\)/i,
    });
    fireEvent.click(customTab);

    expect(customTab).toHaveAttribute("data-state", "active");
    expect(window.location.search).toContain("tab=custom");

    // Click back to parts tab
    const partsTab = screen.getByRole("tab", { name: /Phụ tùng \/ Serial/i });
    fireEvent.click(partsTab);

    expect(partsTab).toHaveAttribute("data-state", "active");
    expect(window.location.search).not.toContain("tab=");
  });

  it("omits tabs when fixedTrackingPolicy is passed (legacy single-view mode)", () => {
    render(<TrackedGoodsPage fixedTrackingPolicy="VEHICLE" />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.queryByRole("tab", { name: /Phụ tùng \/ Serial/i }),
    ).not.toBeInTheDocument();
  });

  it("renders specialized columns on tab lot (lotNo, notes)", () => {
    render(<TrackedGoodsPage initialTab="lot" />, { wrapper: createWrapper() });

    expect(screen.getByText(/Mã lô/i)).toBeInTheDocument();
    expect(screen.getByText(/Ghi chú/i)).toBeInTheDocument();
    expect(screen.queryByText(/Số VIN/i)).not.toBeInTheDocument();
  });

  it("renders specialized columns on tab custom (attributes, notes)", () => {
    render(<TrackedGoodsPage initialTab="custom" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/Thuộc tính tùy chỉnh/i)).toBeInTheDocument();
    expect(screen.getByText(/Mã Barcode \/ QR/i)).toBeInTheDocument();
    expect(screen.getByText(/Ghi chú/i)).toBeInTheDocument();
    expect(screen.queryByText(/Số VIN/i)).not.toBeInTheDocument();
  });

  it("renders specialized columns on tab vehicle (vin, engine, dealer)", () => {
    render(<TrackedGoodsPage initialTab="vehicle" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/Số VIN/i)).toBeInTheDocument();
    expect(screen.getByText(/Số máy/i)).toBeInTheDocument();
    expect(screen.getByText(/Mã đại lý/i)).toBeInTheDocument();
    expect(screen.getByText(/Tên đại lý/i)).toBeInTheDocument();
    expect(screen.queryByText(/Số Lô \(Lot\)/i)).not.toBeInTheDocument();
  });

  it("preserves state when switching between tabs without resetting filters", () => {
    render(<TrackedGoodsPage />, {
      wrapper: createWrapper(),
    });

    const lotTab = screen.getByRole("tab", { name: /Lô \(Lot\)/i });
    fireEvent.click(lotTab);

    expect(lotTab).toHaveAttribute("data-state", "active");

    const partsTab = screen.getByRole("tab", { name: /Phụ tùng \/ Serial/i });
    fireEvent.click(partsTab);

    expect(partsTab).toHaveAttribute("data-state", "active");
  });

  it("displays filter count for table when column search or filter is active", () => {
    mockColumnSearch["inventory-tracked-goods-parts-table"] = {
      goodsIssueNo: "XK-2026",
    };

    render(<TrackedGoodsPage initialTab="parts" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("(1)")).toBeInTheDocument();
  });

  it("maintains independent filter counts for each table when switching tabs", () => {
    mockColumnSearch["inventory-tracked-goods-parts-table"] = {
      goodsIssueNo: "XK-2026",
    };
    mockColumnSearch["inventory-tracked-goods-lot-table"] = {};

    render(<TrackedGoodsPage initialTab="parts" />, {
      wrapper: createWrapper(),
    });

    // parts tab has (1)
    expect(screen.getByText("(1)")).toBeInTheDocument();

    // switch to lot tab (0 filters)
    const lotTab = screen.getByRole("tab", { name: /Lô \(Lot\)/i });
    fireEvent.click(lotTab);
    expect(screen.queryByText("(1)")).not.toBeInTheDocument();

    // switch back to parts tab (restores count (1))
    const partsTab = screen.getByRole("tab", { name: /Phụ tùng \/ Serial/i });
    fireEvent.click(partsTab);
    expect(screen.getByText("(1)")).toBeInTheDocument();
  });
});
