import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import type { V2TableToolbarConfig } from "@/v2/shared/components/organisms/v2-standard-table";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import { V2PageHeaderVariant } from "@/v2/shared/components/molecules/v2-page-header";
import { V2ModulePage } from "./V2ModulePage";
import {
  V2ModulePageTabVariant,
  V2ModulePageVariant,
  type V2ModuleTab,
} from "./V2ModulePage.type";

const captured = vi.hoisted(() => ({
  props: null as null | Record<string, any>,
}));

vi.mock("@/v2/shared/components/organisms/v2-standard-table", async () => {
  const actual = await vi.importActual<
    typeof import("@/v2/shared/components/organisms/v2-standard-table")
  >("@/v2/shared/components/organisms/v2-standard-table");
  return {
    ...actual,
    V2StandardTable: (props: Record<string, any>) => {
      captured.props = props;
      return (
        <div data-testid="standard-table">
          {props.tableId}:{props.items.length}
        </div>
      );
    },
  };
});

const mockViewport = () =>
  vi.spyOn(viewportHook, "useViewport").mockReturnValue({
    width: 1280,
    height: 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

type Row = { id: string };

const refetch = vi.fn();
const useData = vi.fn((query: V2TableQuery) => ({
  items: [{ id: "1" }, { id: "2" }],
  total: 2,
  loading: query.page < 0,
  refetch,
}));

const makeListTab = (toolbar?: V2TableToolbarConfig): V2ModuleTab<Row> => ({
  key: "list",
  label: "Danh sách",
  kind: "list",
  table: { tableId: "orders", columns: [], getRowKey: (r) => r.id, toolbar },
  useData,
});

const dashboardTab: V2ModuleTab<Row> = {
  key: "dashboard",
  label: "Tổng quan",
  kind: "dashboard",
  content: <div>KPI tổng quan</div>,
};

const renderPage = (
  props: Partial<React.ComponentProps<typeof V2ModulePage<Row>>> = {},
) =>
  render(
    <V2ModulePage<Row>
      title="Hóa đơn"
      tabs={[dashboardTab, makeListTab()]}
      {...props}
    />,
  );

describe("V2ModulePage", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/v2/orders");
    useData.mockClear();
    refetch.mockClear();
    captured.props = null;
    mockViewport();
  });
  afterEach(() => vi.restoreAllMocks());

  it("renders the header title and the tab labels", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: "Hóa đơn" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Tổng quan")).toBeInTheDocument();
    expect(screen.getByText("Danh sách")).toBeInTheDocument();
  });

  it("shows the first tab and does not call useData for an unopened list tab", () => {
    renderPage();
    expect(screen.getByText("KPI tổng quan")).toBeInTheDocument();
    expect(screen.queryByTestId("standard-table")).not.toBeInTheDocument();
    expect(useData).not.toHaveBeenCalled();
  });

  it("mounts the list tab on first open, calls useData and keeps the tab on the URL", () => {
    renderPage();
    fireEvent.click(screen.getByText("Danh sách"));
    expect(screen.getByTestId("standard-table")).toHaveTextContent("orders:2");
    expect(useData).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
    expect(window.location.search).toContain("tab=list");
  });

  it("feeds query changes back into useData and the URL", () => {
    renderPage();
    fireEvent.click(screen.getByText("Danh sách"));
    const query = useData.mock.calls[useData.mock.calls.length - 1]![0];
    act(() => captured.props!.onQueryChange({ ...query, page: 2 }));
    expect(useData).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
    );
    expect(window.location.search).toContain("list.page=2");
  });

  it("restores the list tab and its query from the URL", () => {
    window.history.replaceState(null, "", "/v2/orders?tab=list&list.page=4");
    renderPage();
    expect(screen.getByTestId("standard-table")).toBeInTheDocument();
    expect(useData).toHaveBeenCalledWith(expect.objectContaining({ page: 4 }));
  });

  it("calls onTabChange when another tab is clicked", () => {
    const onTabChange = vi.fn();
    renderPage({ onTabChange });
    fireEvent.click(screen.getByText("Danh sách"));
    expect(onTabChange).toHaveBeenCalledWith("list");
  });

  it("does not touch the URL when syncUrl is off", () => {
    renderPage({ syncUrl: false });
    fireEvent.click(screen.getByText("Danh sách"));
    expect(screen.getByTestId("standard-table")).toBeInTheDocument();
    expect(window.location.search).not.toContain("tab=");
  });

  it("honours a controlled activeTab", () => {
    renderPage({ activeTab: "list" });
    expect(screen.getByTestId("standard-table")).toBeInTheDocument();
  });

  it("renders overlays", () => {
    renderPage({ overlays: <div>Drawer chi tiết</div> });
    expect(screen.getByText("Drawer chi tiết")).toBeInTheDocument();
  });

  it("applies tabBarClassName to the tab bar", () => {
    renderPage({
      tabVariant: V2ModulePageTabVariant.PILL,
      tabBarClassName: "border-b-0 pb-0",
    });
    const tablist = screen
      .getAllByRole("tablist")
      .find((el) => el.className.includes("border-b-0"));
    expect(tablist).toBeDefined();
    expect(tablist).toHaveClass("pb-0");
  });

  it("renders V2ModulePageVariant.CARD with header card and pill tabs", () => {
    const { container } = renderPage({ variant: V2ModulePageVariant.CARD });
    const header = container.querySelector("header");
    expect(header).toHaveClass("bg-card", "rounded-2xl", "border");
    const activeTab = screen.getByRole("tab", { name: "Tổng quan" });
    expect(activeTab).toHaveClass("bg-primary", "text-primary-fg");
    expect(screen.getByRole("tablist")).toHaveClass("border-b");
  });

  it("allows overriding headerVariant and tabVariant independently", () => {
    const { container } = renderPage({
      variant: V2ModulePageVariant.CARD,
      headerVariant: V2PageHeaderVariant.FLAT,
      tabVariant: V2ModulePageTabVariant.PILL,
    });
    const header = container.querySelector("header");
    expect(header).not.toHaveClass("bg-card");
    expect(screen.getByRole("tab", { name: "Tổng quan" })).toHaveClass(
      "bg-primary",
    );
  });
});
