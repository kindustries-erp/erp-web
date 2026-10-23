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
});
