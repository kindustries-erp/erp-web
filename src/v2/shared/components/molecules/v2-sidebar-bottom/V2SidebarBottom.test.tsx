import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { V2SidebarBottom } from "./V2SidebarBottom";

describe("V2SidebarBottom Molecule", () => {
  it("renders user avatar initials, display name, and notification button when expanded", () => {
    const handleUserClick = vi.fn();
    const handleNotifyClick = vi.fn();

    render(
      <V2SidebarBottom
        avatarInitials="AD"
        displayName="Admin User"
        unreadCount={3}
        onUserClick={handleUserClick}
        onNotificationClick={handleNotifyClick}
      />,
    );

    expect(screen.getByText("AD")).toBeInTheDocument();
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByTestId("notification-dot")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Admin User" }));
    expect(handleUserClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Thông báo" }));
    expect(handleNotifyClick).toHaveBeenCalledTimes(1);
  });

  it("hides display name and collapses layout when collapsed is true", () => {
    render(
      <V2SidebarBottom
        collapsed={true}
        avatarInitials="AD"
        displayName="Admin User"
        unreadCount={0}
      />,
    );

    expect(screen.getByText("AD")).toBeInTheDocument();
    expect(screen.queryByText("Admin User")).not.toBeInTheDocument();
    expect(screen.queryByTestId("notification-dot")).not.toBeInTheDocument();
  });

  it("gọi userMenuNode dạng render prop với đúng trạng thái collapsed", () => {
    const renderUserMenu = vi.fn(({ collapsed }: { collapsed: boolean }) => (
      <div data-testid="custom-user-menu">
        <span>Avatar</span>
        {!collapsed && <span>Full Email</span>}
      </div>
    ));

    const { rerender } = render(
      <V2SidebarBottom collapsed={false} userMenuNode={renderUserMenu} />,
    );

    expect(screen.getByText("Full Email")).toBeInTheDocument();
    expect(renderUserMenu).toHaveBeenCalledWith({ collapsed: false });

    rerender(
      <V2SidebarBottom collapsed={true} userMenuNode={renderUserMenu} />,
    );

    expect(screen.queryByText("Full Email")).not.toBeInTheDocument();
    expect(renderUserMenu).toHaveBeenCalledWith({ collapsed: true });
  });
});
