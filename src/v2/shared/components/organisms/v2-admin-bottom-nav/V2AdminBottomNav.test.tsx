import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2AdminRouteId } from "@/v2/shared/types";
import { V2NavIndicator } from "@/v2/shared/components/molecules/v2-nav-item";
import { V2AdminBottomNav } from "./V2AdminBottomNav";
import { V2AdminBottomNavVariant } from "./V2AdminBottomNav.type";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_k: string, fallback: string) => fallback,
    locale: "vi",
  }),
}));

describe("V2AdminBottomNav Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders default 4 navigation items with accessible aria-label and slide-in animation", () => {
    render(<V2AdminBottomNav activeId={V2AdminRouteId.DASHBOARD} />);

    const nav = screen.getByTestId("v2-admin-bottom-nav");
    expect(nav).toBeDefined();
    expect(nav.className).toContain("animate-slide-in-from-bottom");

    expect(screen.getByText("Tổng quan")).toBeDefined();
    expect(screen.getByText("Báo cáo")).toBeDefined();
    expect(screen.getByText("Người dùng")).toBeDefined();
    expect(screen.getByText("Cài đặt")).toBeDefined();
  });

  it('highlights the active item with aria-current="page"', () => {
    render(<V2AdminBottomNav activeId={V2AdminRouteId.USERS} />);

    const activeBtn = screen.getByTestId(
      `admin-nav-item-${V2AdminRouteId.USERS}`,
    );
    expect(activeBtn.getAttribute("aria-current")).toBe("page");

    const inactiveBtn = screen.getByTestId(
      `admin-nav-item-${V2AdminRouteId.DASHBOARD}`,
    );
    expect(inactiveBtn.getAttribute("aria-current")).toBeNull();
  });

  it("triggers onNavigate callback when clicking an item", () => {
    const handleNavigate = vi.fn();
    render(
      <V2AdminBottomNav
        activeId={V2AdminRouteId.DASHBOARD}
        onNavigate={handleNavigate}
      />,
    );

    const reportsBtn = screen.getByTestId(
      `admin-nav-item-${V2AdminRouteId.SALES_REPORTS}`,
    );
    fireEvent.click(reportsBtn);

    expect(handleNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: V2AdminRouteId.SALES_REPORTS,
        href: "/v2/admin/reports/sales",
      }),
    );
  });

  it("render variant floating va indicator dot", () => {
    render(
      <V2AdminBottomNav
        activeId={V2AdminRouteId.DASHBOARD}
        variant="floating"
        indicator="dot"
      />,
    );

    const nav = screen.getByTestId("v2-admin-bottom-nav");
    expect(nav.className).toContain("rounded-2xl");
    expect(nav.className).toContain("shadow-xl");
    expect(screen.getByTestId("admin-bottom-nav-dot")).toBeInTheDocument();
  });

  it("hỗ trợ cấu hình qua enums chuẩn V2AdminBottomNavVariant và V2NavIndicator", () => {
    render(
      <V2AdminBottomNav
        activeId={V2AdminRouteId.DASHBOARD}
        variant={V2AdminBottomNavVariant.FLOATING}
        indicator={V2NavIndicator.DOT}
      />,
    );

    const nav = screen.getByTestId("v2-admin-bottom-nav");
    expect(nav.className).toContain("rounded-2xl");
    expect(screen.getByTestId("admin-bottom-nav-dot")).toBeInTheDocument();
  });
});
