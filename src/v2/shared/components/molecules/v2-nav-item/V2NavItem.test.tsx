import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Home } from "lucide-react";
import { V2NavItem } from "./V2NavItem";

describe("V2NavItem Molecule", () => {
  it("render đúng label và gọi onClick khi click", () => {
    const handleClick = vi.fn();
    render(
      <V2NavItem
        label="Trang chủ"
        icon={Home}
        onClick={handleClick}
        variant="sidebar"
      />,
    );

    const button = screen.getByRole("button", { name: "Trang chủ" });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("render biến thể bottom-nav với badgeCount", () => {
    render(
      <V2NavItem
        label="Thông báo"
        icon={Home}
        variant="bottom-nav"
        badgeCount={5}
      />,
    );

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Thông báo")).toBeInTheDocument();
  });

  it("ẩn label khi isCollapsed=true trên sidebar", () => {
    render(
      <V2NavItem
        label="Cài đặt"
        icon={Home}
        variant="sidebar"
        isCollapsed={true}
      />,
    );

    expect(screen.queryByText("Cài đặt")).not.toBeInTheDocument();
  });
});
