import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TabBar } from "@/core/components/layout/TabBar";

// -- Mocks --------------------------------------------------------------------

const mockNavigate = vi.fn();
const mockCloseTab = vi.fn();
const mockReorderTabs = vi.fn();

let mockOpenTabs = ["dashboard", "sales", "purchasing"];
let mockCurrentPage = "sales";
let mockCurrentInstanceId = "sales";

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => ({
    openTabs: mockOpenTabs,
    currentPage: mockCurrentPage,
    currentInstanceId: mockCurrentInstanceId,
    navigate: mockNavigate,
    closeTab: mockCloseTab,
    reorderTabs: mockReorderTabs,
  }),
  STATIC_TABS: {
    dashboard: { labelKey: "nav.items.dashboard", closable: false },
  },
  SECTION_ROOTS: {
    sales: { labelKey: "nav.items.sales", group: "sales" },
    purchasing: { labelKey: "nav.items.purchasing", group: "purchasing" },
    cashflow: { labelKey: "nav.items.cashflow", group: "cashflow" },
  },
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => {
    const map: Record<string, string> = {
      "nav.items.dashboard": "Tổng quan",
      "nav.items.sales": "Bán hàng",
      "nav.items.purchasing": "Mua hàng",
      "nav.items.cashflow": "Dòng tiền",
    };
    return map[key] ?? key;
  },
}));

vi.mock("@/shared/components/ContextMenu", () => ({
  usePageContextMenu: () => () => {},
}));

describe("TabBar", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockCloseTab.mockClear();
    mockReorderTabs.mockClear();
    mockOpenTabs = ["dashboard", "sales", "purchasing"];
    mockCurrentPage = "sales";
  });

  it("renders all open tabs with translated labels", () => {
    render(<TabBar />);
    expect(screen.getByText("Tổng quan")).toBeInTheDocument();
    expect(screen.getByText("Bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Mua hàng")).toBeInTheDocument();
  });

  it("highlights the active tab", () => {
    render(<TabBar />);
    const activeTab = screen.getByText("Bán hàng").closest(".tab-item");
    expect(activeTab?.className).toContain("font-semibold");
  });

  it("navigates when a tab is clicked", () => {
    render(<TabBar />);
    fireEvent.click(screen.getByText("Mua hàng"));
    expect(mockNavigate).toHaveBeenCalledWith("purchasing", 1);
  });

  it("renders #2 badge and highlights only the active tab instance for active page", () => {
    mockOpenTabs = [
      {
        instanceId: "dashboard",
        pageKey: "dashboard",
        instanceIndex: 1,
      } as any,
      { instanceId: "sales", pageKey: "sales", instanceIndex: 1 } as any,
      { instanceId: "sales__2", pageKey: "sales", instanceIndex: 2 } as any,
    ];
    mockCurrentPage = "sales";
    mockCurrentInstanceId = "sales";
    render(<TabBar />);
    expect(screen.getByText("#2")).toBeInTheDocument();

    const salesTabs = screen.getAllByText("Bán hàng");
    expect(salesTabs).toHaveLength(2);
    const salesTab1 = salesTabs[0].closest(".tab-item");
    const salesTab2 = salesTabs[1].closest(".tab-item");
    expect(salesTab1?.className).toContain("font-semibold");
    expect(salesTab2?.className).not.toContain("font-semibold");
  });

  it("does NOT show close button on static tabs (dashboard)", () => {
    render(<TabBar />);
    const dashboardTab = screen.getByText("Tổng quan").closest(".tab-item");
    expect(dashboardTab?.querySelector("span.inline-flex")).toBeNull();
  });

  it("shows close button on closable tabs", () => {
    render(<TabBar />);
    const salesTab = screen.getByText("Bán hàng").closest(".tab-item");
    const closeBtn = salesTab?.querySelector("span.inline-flex");
    expect(closeBtn).not.toBeNull();
    expect(closeBtn?.textContent).toBe("×");
  });

  it("calls closeTab when close button is clicked", () => {
    render(<TabBar />);
    const salesTab = screen.getByText("Bán hàng").closest(".tab-item");
    const closeBtn = salesTab!.querySelector("span.inline-flex")!;
    fireEvent.click(closeBtn);
    expect(mockCloseTab).toHaveBeenCalledWith("sales");
    // Should not navigate when closing
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("close button is vertically centered (has items-center and justify-center)", () => {
    render(<TabBar />);
    const salesTab = screen.getByText("Bán hàng").closest(".tab-item");
    const closeBtn = salesTab!.querySelector("span.inline-flex")!;
    expect(closeBtn.className).toContain("items-center");
    expect(closeBtn.className).toContain("justify-center");
    expect(closeBtn.className).toContain("w-4");
    expect(closeBtn.className).toContain("h-4");
  });

  it("renders tabs in the correct order", () => {
    render(<TabBar />);
    const tabs = screen.getAllByText(/Tổng quan|Bán hàng|Mua hàng/);
    expect(tabs[0].textContent).toBe("Tổng quan");
    expect(tabs[1].textContent).toBe("Bán hàng");
    expect(tabs[2].textContent).toBe("Mua hàng");
  });

  it("static tabs are not draggable", () => {
    render(<TabBar />);
    const dashboardTab = screen
      .getByText("Tổng quan")
      .closest(".tab-item") as HTMLElement;
    expect(dashboardTab.getAttribute("draggable")).toBe("false");
  });

  it("closable tabs are draggable on desktop", () => {
    // Default isMobile is false because window.innerWidth > 768 in jsdom
    render(<TabBar />);
    const salesTab = screen
      .getByText("Bán hàng")
      .closest(".tab-item") as HTMLElement;
    expect(salesTab.getAttribute("draggable")).toBe("true");
  });
});
