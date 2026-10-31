import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Home, ShoppingBag, Settings, Plus, User } from "lucide-react";
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

  it("render biến thể floating với classes bo tròn và shadow", () => {
    render(
      <V2BottomNav items={mockNavItems} variant="floating" activeId="home" />,
    );

    const nav = screen.getByTestId("v2-bottom-nav");
    expect(nav.className).toContain("rounded-3xl");
    expect(nav.className).toContain("shadow-2xl");
  });

  it("render biến thể hero-center với nút trung tâm FAB", () => {
    const handleHeroClick = vi.fn();
    const heroItem = {
      id: "create",
      label: "Tạo mới",
      icon: Plus,
      href: "#create",
    };

    render(
      <V2BottomNav
        items={[
          mockNavItems[0],
          mockNavItems[1],
          { id: "users", label: "Người dùng", icon: User, href: "/v2/users" },
          mockNavItems[2],
        ]}
        variant="hero-center"
        centerHeroItem={heroItem}
        onHeroClick={handleHeroClick}
      />,
    );

    const heroBtn = screen.getByTestId("bottom-nav-hero-button");
    expect(heroBtn).toBeInTheDocument();
    fireEvent.click(heroBtn);
    expect(handleHeroClick).toHaveBeenCalledWith(heroItem);
  });

  it("render indicator dot khi indicator=dot", () => {
    render(
      <V2BottomNav items={mockNavItems} indicator="dot" activeId="home" />,
    );

    expect(screen.getByTestId("bottom-nav-dot")).toBeInTheDocument();
  });
});
