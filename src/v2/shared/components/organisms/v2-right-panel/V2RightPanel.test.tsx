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

  it("renders with rounded-2xl floating card, topbar, content and tabbar", () => {
    const handleSearch = vi.fn();
    const handleSelectTab = vi.fn();

    render(
      <V2RightPanel
        breadcrumbs={[{ label: "Bán hàng" }]}
        branchName="Chi nhánh Trung tâm"
        onSearchClick={handleSearch}
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

    expect(screen.getByText("Bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Chi nhánh Trung tâm")).toBeInTheDocument();
    expect(screen.getByTestId("test-content")).toBeInTheDocument();

    const orderTab = screen.getByTestId("v2-tab-item-orders");
    fireEvent.click(orderTab);
    expect(handleSelectTab).toHaveBeenCalledWith("orders");
  });
});
