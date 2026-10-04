import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { LayoutDashboard, Boxes } from "lucide-react";
import { V2TabBar } from "./V2TabBar";

describe("V2TabBar Organism", () => {
  const tabs = [
    {
      id: "dashboard",
      label: "Tổng quan",
      icon: LayoutDashboard,
      isClosable: false,
    },
    { id: "orders", label: "Đơn bán hàng", icon: Boxes, isClosable: true },
  ];

  it("renders tab items and handles selection and close events", () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <V2TabBar
        tabs={tabs}
        activeTabId="orders"
        onTabSelect={handleSelect}
        onTabClose={handleClose}
      />,
    );

    const tabList = screen.getByRole("tablist", { name: "Thanh tab đa nhiệm" });
    expect(tabList).toBeInTheDocument();

    const dashboardTab = screen.getByTestId("v2-tab-item-dashboard");
    fireEvent.click(dashboardTab);
    expect(handleSelect).toHaveBeenCalledWith("dashboard");

    const closeBtn = screen.getByRole("button", {
      name: "Đóng tab Đơn bán hàng",
    });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledWith("orders");
  });

  it("returns null when tabs array is empty", () => {
    const { container } = render(
      <V2TabBar tabs={[]} activeTabId="" onTabSelect={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
