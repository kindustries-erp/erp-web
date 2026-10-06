import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { LayoutDashboard } from "lucide-react";
import { V2TabItem } from "./V2TabItem";

describe("V2TabItem Molecule", () => {
  it("renders active tab with label and icon", () => {
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
    expect(tab).toHaveClass("border-b-primary");

    fireEvent.click(tab);
    expect(handleClick).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByRole("button", { name: "Đóng tab Tổng quan" });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("hides close button when isClosable is false", () => {
    render(<V2TabItem id="home" label="Trang chủ" isClosable={false} />);

    expect(
      screen.queryByRole("button", { name: /Đóng tab/ }),
    ).not.toBeInTheDocument();
  });
});
