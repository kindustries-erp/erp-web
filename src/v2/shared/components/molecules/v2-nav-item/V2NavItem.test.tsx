import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Home } from "lucide-react";
import { V2NavItem } from "./V2NavItem";
import { V2NavItemVariant, V2NavIndicator } from "./V2NavItem.type";

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

  it("render dot indicator khi variant=bottom-nav, indicator=dot và isActive=true", () => {
    render(
      <V2NavItem
        label="Trang chủ"
        icon={Home}
        variant="bottom-nav"
        indicator="dot"
        isActive={true}
      />,
    );

    expect(screen.getByTestId("bottom-nav-dot")).toBeInTheDocument();
  });

  it("render pill indicator khi variant=bottom-nav, indicator=pill và isActive=true", () => {
    render(
      <V2NavItem
        label="Trang chủ"
        icon={Home}
        variant="bottom-nav"
        indicator="pill"
        isActive={true}
      />,
    );

    const button = screen.getByRole("button", { name: "Trang chủ" });
    expect(button.className).toContain("bg-foreground/5");
  });

  it("hỗ trợ truyền variant và indicator qua enum chuẩn", () => {
    render(
      <V2NavItem
        label="Enum Nav"
        icon={Home}
        variant={V2NavItemVariant.BOTTOM_NAV}
        indicator={V2NavIndicator.DOT}
        isActive={true}
      />,
    );

    expect(screen.getByText("Enum Nav")).toBeInTheDocument();
    expect(screen.getByTestId("bottom-nav-dot")).toBeInTheDocument();
  });
});
