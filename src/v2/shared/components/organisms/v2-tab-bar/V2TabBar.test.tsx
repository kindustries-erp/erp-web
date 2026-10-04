import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { LayoutDashboard, Boxes } from "lucide-react";
import { useAppStore } from "@/core/config/appStore";
import { V2TabBar } from "./V2TabBar";

describe("V2TabBar Organism", () => {
  beforeEach(() => {
    act(() => {
      useAppStore.getState().setLocale("vi");
    });
  });

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

  it("updates aria-label and close tab tooltip when locale changes", () => {
    const { rerender } = render(
      <V2TabBar tabs={tabs} activeTabId="orders" onTabSelect={() => {}} />,
    );

    expect(
      screen.getByRole("tablist", { name: "Thanh tab đa nhiệm" }),
    ).toBeInTheDocument();

    act(() => {
      useAppStore.getState().setLocale("en");
    });

    rerender(
      <V2TabBar tabs={tabs} activeTabId="orders" onTabSelect={() => {}} />,
    );

    expect(
      screen.getByRole("tablist", { name: "Multi-task tab bar" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close tab Đơn bán hàng" }),
    ).toBeInTheDocument();
  });

  it("returns null when tabs array is empty", () => {
    const { container } = render(
      <V2TabBar tabs={[]} activeTabId="" onTabSelect={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
