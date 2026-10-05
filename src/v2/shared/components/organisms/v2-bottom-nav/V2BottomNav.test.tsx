import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Home, ShoppingBag, Settings } from "lucide-react";
import { V2BottomNav } from "./V2BottomNav";

const mockNavItems = [
  { id: "home", label: "Trang chủ", icon: Home, href: "/v2" },
  {
    id: "orders",
    label: "Đơn hàng",
    icon: ShoppingBag,
    href: "/v2/orders",
    badgeCount: 2,
  },
  { id: "settings", label: "Cài đặt", icon: Settings, href: "/v2/settings" },
];

describe("V2BottomNav Organism", () => {
  it("render danh sách các items", () => {
    render(<V2BottomNav items={mockNavItems} activeId="home" />);
    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
    expect(screen.getByText("Đơn hàng")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("gọi onNavigate khi click chọn item", () => {
    const handleNavigate = vi.fn();
    render(<V2BottomNav items={mockNavItems} onNavigate={handleNavigate} />);

    fireEvent.click(screen.getByText("Đơn hàng"));
    expect(handleNavigate).toHaveBeenCalledWith(mockNavItems[1]);
  });
});
