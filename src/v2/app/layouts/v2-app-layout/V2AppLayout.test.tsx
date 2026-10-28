import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Wrench } from "lucide-react";
import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";
import { useV2MobileNavStore } from "@/v2/shared/stores/useV2MobileNavStore";
import { V2AppLayout } from "./V2AppLayout";

describe("V2AppLayout Switcher", () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it("render Desktop variant khi màn hình lớn", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });
    render(
      <V2AppLayout>
        <div>Content Desktop</div>
      </V2AppLayout>,
    );

    expect(screen.getByTestId("v2-app-layout-desktop")).toBeInTheDocument();
    expect(screen.getByTestId("v2-right-panel")).toBeInTheDocument();
    expect(screen.getByText("Content Desktop")).toBeInTheDocument();
  });

  it("render Mobile variant khi màn hình nhỏ và gọi onBranchClick khi click tenant", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 390,
    });
    const handleBranch = vi.fn();
    render(
      <V2AppLayout tenantName="Greenway Motors" onBranchClick={handleBranch}>
        <div>Content Mobile</div>
      </V2AppLayout>,
    );

    expect(screen.getByTestId("v2-app-layout-mobile")).toBeInTheDocument();
    expect(screen.getByText("Content Mobile")).toBeInTheDocument();

    const tenantEl = screen.getByText("Greenway Motors");
    fireEvent.click(tenantEl);
    expect(handleBranch).toHaveBeenCalledTimes(1);
  });

  it("render sections trong mobile catalog modal khi click Tất cả", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 390,
    });
    const mockSections = [
      {
        id: "sec-garage",
        label: "GARAGE",
        items: [
          {
            id: "garage-dashboard",
            label: "Hoạt động garage",
            icon: Wrench,
            href: "/garage",
          },
        ],
      },
    ];

    render(
      <V2AppLayout sections={mockSections}>
        <div>Content Mobile</div>
      </V2AppLayout>,
    );

    const catalogBtn = screen.getByText("Tất cả");
    fireEvent.click(catalogBtn);

    expect(screen.getAllByText("GARAGE").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hoạt động garage").length).toBeGreaterThan(0);
    expect(screen.queryByText("Quay lại ERP V1")).not.toBeInTheDocument();
  });

  it("hiển thị chính xác 6 menu items ở bottom nav và cho phép tùy chỉnh", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 390,
    });
    useV2MobileNavStore.setState({ pinnedIds: [] });

    render(
      <V2AppLayout>
        <div>Content Mobile</div>
      </V2AppLayout>,
    );

    const bottomNav = screen.getByTestId("v2-bottom-nav");
    const navButtons = bottomNav.querySelectorAll("button");
    expect(navButtons.length).toBe(6);
    expect(navButtons[5]).toHaveTextContent("Tất cả");

    // Mở modal Tất cả
    fireEvent.click(navButtons[5]);
    expect(screen.getByText(/Tùy chỉnh lối tắt/i)).toBeInTheDocument();

    // Bật chế độ tùy chỉnh
    const editBtn = screen.getByText("Sửa");
    fireEvent.click(editBtn);

    // Đang có 5/5 mục. Tìm một mục chưa được chọn và click -> Bị chặn và hiện thông báo
    // Tìm button "Khách hàng" (thuộc section Bán hàng, chưa nằm trong 5 default items)
    const customerBtn = screen.queryByRole("button", { name: /Khách hàng/i });
    if (customerBtn) {
      fireEvent.click(customerBtn);
      // Hiển thị thông báo giới hạn
      expect(screen.getByTestId("limit-warning-banner")).toBeInTheDocument();
      expect(
        screen.getByText(/Đã chọn đủ 5\/5 mục lối tắt/i),
      ).toBeInTheDocument();
    }

    // Bấm Xong
    const doneBtn = screen.getByText("Xong");
    fireEvent.click(doneBtn);
  });

  it("tự động cập nhật nội dung đa ngôn ngữ khi thay đổi locale", () => {
    useV2LocaleStore.setState({ locale: "vi" });
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });

    render(
      <V2AppLayout>
        <div>Content</div>
      </V2AppLayout>,
    );

    expect(screen.getAllByText("Tổng quan").length).toBeGreaterThan(0);
  });

  it("render userMenuNode và notificationNode trên mobile header", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 390,
    });

    render(
      <V2AppLayout
        userMenuNode={<div data-testid="mobile-user-menu">User Menu</div>}
        notificationNode={
          <div data-testid="mobile-notification">Notification</div>
        }
      >
        <div>Content</div>
      </V2AppLayout>,
    );

    expect(screen.getByTestId("mobile-user-menu")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-notification")).toBeInTheDocument();
  });

  it("hiển thị bộ chọn theme và ngôn ngữ trong mobile catalog modal và gọi onThemeChange", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 390,
    });

    const handleThemeChange = vi.fn();
    render(
      <V2AppLayout
        currentTheme="classic-light"
        onThemeChange={handleThemeChange}
      >
        <div>Content</div>
      </V2AppLayout>,
    );

    const catalogBtn = screen.getByText("Tất cả");
    fireEvent.click(catalogBtn);

    // Kiểm tra card cài đặt giao diện & ngôn ngữ
    expect(
      screen.getByTestId("mobile-appearance-settings"),
    ).toBeInTheDocument();
    expect(screen.getByText("Giao diện")).toBeInTheDocument();
    expect(screen.getByText("Ngôn ngữ")).toBeInTheDocument();

    // Thử click chuyển theme sang Dark
    const darkBtn = screen.getByText("Tối");
    fireEvent.click(darkBtn);
    expect(handleThemeChange).toHaveBeenCalledWith("classic-dark");

    // Thử click chuyển theme sang Midnight
    const midnightBtn = screen.getByText("Midnight");
    fireEvent.click(midnightBtn);
    expect(handleThemeChange).toHaveBeenCalledWith("midnight");

    // Thử click chuyển theme sang Sáng
    const lightBtn = screen.getByText("Sáng");
    fireEvent.click(lightBtn);
    expect(handleThemeChange).toHaveBeenCalledWith("classic-light");
  });

  it("chuyển tiếp collapsed, onToggleCollapse và userMenuNode render prop xuống desktop sidebar", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });

    const handleToggle = vi.fn();
    const renderUserMenu = vi.fn(({ collapsed }: { collapsed: boolean }) => (
      <div data-testid="desktop-user-menu">
        <span>Avatar</span>
        {!collapsed && <span>User Name</span>}
      </div>
    ));

    const { rerender } = render(
      <V2AppLayout
        collapsed={false}
        onToggleCollapse={handleToggle}
        userMenuNode={renderUserMenu}
      >
        <div>Content</div>
      </V2AppLayout>,
    );

    const sidebar = screen.getByTestId("v2-sidebar");
    expect(sidebar).toHaveClass("w-[210px]");
    expect(screen.getByText("User Name")).toBeInTheDocument();
    expect(renderUserMenu).toHaveBeenCalledWith({ collapsed: false });

    const toggleBtn = screen.getByTestId("v2-sidebar-toggle-btn");
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);

    rerender(
      <V2AppLayout
        collapsed={true}
        onToggleCollapse={handleToggle}
        userMenuNode={renderUserMenu}
      >
        <div>Content</div>
      </V2AppLayout>,
    );

    expect(sidebar).toHaveClass("w-[58px]");
    expect(sidebar).toHaveAttribute("data-collapsed", "true");
    expect(screen.queryByText("User Name")).not.toBeInTheDocument();
    expect(renderUserMenu).toHaveBeenCalledWith({ collapsed: true });
  });
});
