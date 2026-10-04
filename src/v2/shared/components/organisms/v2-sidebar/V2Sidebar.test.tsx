import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { LayoutDashboard, Users, Boxes } from "lucide-react";
import { useAppStore } from "@/core/config/appStore";
import { V2Sidebar } from "./V2Sidebar";
import { V2SidebarSectionData } from "./V2Sidebar.type";

const mockSections: V2SidebarSectionData[] = [
  {
    id: "general",
    label: "TỔNG QUAN",
    items: [
      {
        id: "dashboard",
        label: "Tổng quan",
        icon: LayoutDashboard,
        href: "/v2/dashboard",
      },
    ],
  },
  {
    id: "sales",
    label: "BÁN HÀNG",
    items: [
      {
        id: "orders",
        label: "Đơn bán hàng",
        icon: Boxes,
        href: "/v2/sales/orders",
        badgeCount: 5,
      },
      {
        id: "customers",
        label: "Khách hàng",
        icon: Users,
        href: "/v2/sales/customers",
      },
    ],
  },
];

describe("V2Sidebar Organism", () => {
  beforeEach(() => {
    act(() => {
      useAppStore.getState().setLocale("vi");
    });
  });

  it("renders with 210px width floating card, sections, items and user footer", () => {
    const handleNavigate = vi.fn();

    render(
      <V2Sidebar
        sections={mockSections}
        activeId="dashboard"
        onNavigate={handleNavigate}
        user={{ displayName: "Nguyễn Văn A", avatarInitials: "NA" }}
      />,
    );

    const aside = screen.getByTestId("v2-sidebar");
    expect(aside).toHaveClass("w-[210px]");
    expect(aside).toHaveClass("rounded-2xl");

    expect(screen.getByText("TỔNG QUAN")).toBeInTheDocument();
    expect(screen.getByText("BÁN HÀNG")).toBeInTheDocument();
    expect(screen.getByText("Tổng quan")).toBeInTheDocument();
    expect(screen.getByText("Đơn bán hàng")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Đơn bán hàng"));
    expect(handleNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "orders" }),
    );
  });

  it("toggles collapse to 58px width when clicking toggle button", () => {
    render(<V2Sidebar sections={mockSections} activeId="dashboard" />);

    const aside = screen.getByTestId("v2-sidebar");
    expect(aside).toHaveClass("w-[210px]");

    const toggleBtn = screen.getByTestId("v2-sidebar-toggle-btn");
    fireEvent.click(toggleBtn);

    expect(aside).toHaveClass("w-[58px]");
  });

  it("updates header and bottom labels when locale changes", () => {
    const { rerender } = render(
      <V2Sidebar sections={mockSections} activeId="dashboard" />,
    );

    expect(screen.getByLabelText("Thông báo")).toBeInTheDocument();
    expect(screen.getByText("Quản trị viên")).toBeInTheDocument();

    act(() => {
      useAppStore.getState().setLocale("en");
    });

    rerender(<V2Sidebar sections={mockSections} activeId="dashboard" />);

    expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();
  });
});
