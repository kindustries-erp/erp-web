import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { LayoutDashboard, Boxes } from "lucide-react";
import { V2RightPanel } from "./V2RightPanel";

describe("V2RightPanel Organism", () => {
  const mockTabs = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "orders", label: "Đơn bán hàng", icon: Boxes },
  ];

  it("renders with rounded-2xl floating card, top tabbar, content and bottom statusbar", () => {
    const handleSearch = vi.fn();
    const handleSelectTab = vi.fn();
    const handleBranch = vi.fn();

    render(
      <V2RightPanel
        breadcrumbs={[{ label: "Bán hàng" }]}
        branchName="Chi nhánh Trung tâm"
        onSearchClick={handleSearch}
        onBranchClick={handleBranch}
        tabs={mockTabs}
        activeTabId="dashboard"
        onTabSelect={handleSelectTab}
      >
        <div data-testid="test-content">Nội dung trang nghiệp vụ</div>
      </V2RightPanel>,
    );

    const panel = screen.getByTestId("v2-right-panel");
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveClass("rounded-2xl");

    // Tab Bar at top
    expect(screen.getByTestId("v2-tab-bar")).toBeInTheDocument();
    const orderTab = screen.getByTestId("v2-tab-item-orders");
    fireEvent.click(orderTab);
    expect(handleSelectTab).toHaveBeenCalledWith("orders");

    // Content in middle
    expect(screen.getByTestId("test-content")).toBeInTheDocument();

    // Status Bar at bottom with breadcrumb and branch
    expect(screen.getByTestId("v2-status-bar")).toBeInTheDocument();
    expect(screen.getByText("Bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Chi nhánh Trung tâm")).toBeInTheDocument();

    // Quick search trigger in top tab bar extra
    fireEvent.click(
      screen.getByRole("button", { name: "Tìm kiếm nhanh hệ thống" }),
    );
    expect(handleSearch).toHaveBeenCalledTimes(1);
  });

  it("renders V2Topbar at top when no tabs are provided (fallback mode)", () => {
    render(
      <V2RightPanel
        breadcrumbs={[{ label: "Hệ thống" }, { label: "Cấu hình" }]}
        branchName="Chi nhánh Đà Nẵng"
      >
        <div data-testid="admin-content">Admin Settings</div>
      </V2RightPanel>,
    );

    expect(screen.getByTestId("v2-topbar")).toBeInTheDocument();
    expect(screen.queryByTestId("v2-tab-bar")).not.toBeInTheDocument();
    expect(screen.queryByTestId("v2-status-bar")).not.toBeInTheDocument();
    expect(screen.getByText("Hệ thống")).toBeInTheDocument();
    expect(screen.getByText("Cấu hình")).toBeInTheDocument();
    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
  });
});
