import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { LayoutDashboard } from "lucide-react";
import { V2TabItem } from "./V2TabItem";

describe("V2TabItem Molecule", () => {
  it("renders active tab with label, icon and pill styling", () => {
    const handleClick = vi.fn();
    const handleClose = vi.fn();

    render(
      <V2TabItem
        id="dashboard"
        label="Tổng quan"
        icon={LayoutDashboard}
        isActive={true}
        isClosable={true}
        onClick={handleClick}
        onClose={handleClose}
      />,
    );

    const tab = screen.getByRole("tab", { name: /Tổng quan/ });
    expect(tab).toHaveAttribute("aria-selected", "true");
    expect(tab).toHaveClass("rounded-md", "font-semibold");

    // Active tab renders icon
    expect(tab.querySelector("svg")).toBeInTheDocument();

    fireEvent.click(tab);
    expect(handleClick).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByRole("button", { name: "Đóng tab Tổng quan" });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("hides icon when tab is inactive and showIconOnActiveOnly is true", () => {
    render(
      <V2TabItem
        id="reports"
        label="Báo cáo"
        icon={LayoutDashboard}
        isActive={false}
      />,
    );

    const tab = screen.getByRole("tab", { name: /Báo cáo/ });
    expect(tab).toHaveAttribute("aria-selected", "false");
    expect(tab).toHaveClass("rounded-md");
    // Inactive tab should not render tab icon
    expect(
      tab.querySelector(".lucide-layout-dashboard"),
    ).not.toBeInTheDocument();
    expect(
      tab.querySelector("[data-testid='v2-tab-item-icon'] svg"),
    ).not.toBeInTheDocument();
  });

  it("hides close button when isClosable is false", () => {
    render(<V2TabItem id="home" label="Trang chủ" isClosable={false} />);

    expect(
      screen.queryByRole("button", { name: /Đóng tab/ }),
    ).not.toBeInTheDocument();
  });

  it("applies dragging styles when isDragging is true", () => {
    render(
      <V2TabItem
        id="drag-test"
        label="Kéo thả"
        isActive={true}
        isDragging={true}
      />,
    );

    const tab = screen.getByRole("tab", { name: /Kéo thả/ });
    expect(tab).toHaveClass("opacity-50", "scale-[1.02]");
  });
});
