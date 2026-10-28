import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Shield, Users, FileText } from "lucide-react";
import { V2SidebarSubGroup } from "./V2SidebarSubGroup";
import type { V2SidebarItem } from "@/v2/shared/components/organisms/v2-sidebar/V2Sidebar.type";

const mockGroupItem: V2SidebarItem = {
  id: "sub-access",
  label: "Quản lý truy cập",
  icon: Shield,
  href: "/users",
  children: [
    {
      id: "users",
      label: "Quản lý người dùng",
      icon: Users,
      href: "/users",
    },
    {
      id: "roles",
      label: "Phân quyền & Vai trò",
      icon: Shield,
      href: "/roles",
    },
    {
      id: "logs",
      label: "Nhật ký hoạt động",
      icon: FileText,
      href: "/logs",
    },
  ],
};

describe("V2SidebarSubGroup Molecule (Flyout Popover)", () => {
  it("renders trigger in expanded sidebar (210px) and opens flyout popover on interaction", () => {
    const handleNavigate = vi.fn();

    render(
      <V2SidebarSubGroup
        item={mockGroupItem}
        isCollapsed={false}
        activeId="roles"
        onNavigate={handleNavigate}
      />,
    );

    const trigger = screen.getByTestId(
      "v2-sidebar-subgroup-trigger-sub-access",
    );
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText("Quản lý truy cập")).toBeInTheDocument();

    // Trigger Radix Dropdown Popover
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("Quản lý người dùng")).toBeInTheDocument();
    expect(screen.getByText("Phân quyền & Vai trò")).toBeInTheDocument();
    expect(screen.getByText("Nhật ký hoạt động")).toBeInTheDocument();

    // Click child item
    fireEvent.click(screen.getByTestId("v2-subgroup-item-users"));
    expect(handleNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "users" }),
    );
  });

  it("renders trigger in collapsed sidebar (58px) and opens flyout popover", () => {
    const handleNavigate = vi.fn();

    render(
      <V2SidebarSubGroup
        item={mockGroupItem}
        isCollapsed={true}
        onNavigate={handleNavigate}
      />,
    );

    const trigger = screen.getByTestId(
      "v2-sidebar-subgroup-trigger-sub-access",
    );
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("title", "Quản lý truy cập");

    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("Quản lý người dùng")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("v2-subgroup-item-roles"));
    expect(handleNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "roles" }),
    );
  });
});
