import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Home } from "lucide-react";
import { V2SidebarNavItem } from "./V2SidebarNavItem";

describe("V2SidebarNavItem Molecule", () => {
  it("render đúng label và gọi onClick", () => {
    const handleClick = vi.fn();
    render(
      <V2SidebarNavItem
        label="Đơn bán hàng"
        icon={Home}
        onClick={handleClick}
      />,
    );

    const item = screen.getByTestId("v2-sidebar-nav-item");
    expect(item).toBeInTheDocument();
    expect(screen.getByText("Đơn bán hàng")).toBeInTheDocument();
    fireEvent.click(item);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("áp dụng class active khi isActive=true", () => {
    render(<V2SidebarNavItem label="Bán hàng" icon={Home} isActive={true} />);
    const item = screen.getByTestId("v2-sidebar-nav-item");
    expect(item).toHaveClass("font-semibold");
  });

  it("ẩn label khi isCollapsed=true", () => {
    render(
      <V2SidebarNavItem label="Bán hàng" icon={Home} isCollapsed={true} />,
    );
    expect(screen.queryByText("Bán hàng")).not.toBeInTheDocument();
  });
});
