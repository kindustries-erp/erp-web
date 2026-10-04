import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DrawerHeader } from "./DrawerHeader";

describe("V2 DrawerHeader Molecule", () => {
  it("renders title, subtitle, icon, and titleExtra properly", () => {
    render(
      <DrawerHeader
        title="Hóa Đơn #HD-001"
        subtitle="Chi tiết hóa đơn mua hàng"
        icon={<span data-testid="test-icon">icon</span>}
        titleExtra={<span data-testid="status-badge">Đã duyệt</span>}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Hóa Đơn #HD-001")).toBeInTheDocument();
    expect(screen.getByText("Chi tiết hóa đơn mua hàng")).toBeInTheDocument();
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    expect(screen.getByTestId("status-badge")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(<DrawerHeader title="Drawer" onClose={handleClose} />);

    const closeBtn = screen.getByRole("button", { name: "Close drawer" });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders Edit button and triggers onToggleEdit when isEditing=false", () => {
    const handleEdit = vi.fn();
    const { rerender } = render(
      <DrawerHeader
        title="Drawer"
        onClose={vi.fn()}
        onToggleEdit={handleEdit}
        isEditing={false}
      />,
    );

    const editBtn = screen.getByRole("button", {
      name: "Chuyển sang chế độ chỉnh sửa",
    });
    expect(editBtn).toBeInTheDocument();
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledTimes(1);

    // When isEditing is true, edit button should not be displayed
    rerender(
      <DrawerHeader
        title="Drawer"
        onClose={vi.fn()}
        onToggleEdit={handleEdit}
        isEditing={true}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Chuyển sang chế độ chỉnh sửa" }),
    ).not.toBeInTheDocument();
  });

  it("toggles fullscreen button when enableFullscreen is true", () => {
    const handleFullscreen = vi.fn();
    const { rerender } = render(
      <DrawerHeader
        title="Drawer"
        onClose={vi.fn()}
        enableFullscreen={true}
        isFullscreen={false}
        onToggleFullscreen={handleFullscreen}
      />,
    );

    const fullBtn = screen.getByRole("button", { name: "Toàn màn hình" });
    fireEvent.click(fullBtn);
    expect(handleFullscreen).toHaveBeenCalledTimes(1);

    rerender(
      <DrawerHeader
        title="Drawer"
        onClose={vi.fn()}
        enableFullscreen={true}
        isFullscreen={true}
        onToggleFullscreen={handleFullscreen}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Thu nhỏ màn hình" }),
    ).toBeInTheDocument();
  });

  it("toggles right panel button when collapsibleRightPanel is true", () => {
    const handleToggleRightPanel = vi.fn();
    const { rerender } = render(
      <DrawerHeader
        title="Drawer"
        onClose={vi.fn()}
        collapsibleRightPanel={true}
        isRightPanelCollapsed={false}
        onToggleRightPanel={handleToggleRightPanel}
      />,
    );

    const collapseBtn = screen.getByRole("button", {
      name: "Thu gọn cột thông tin phải",
    });
    fireEvent.click(collapseBtn);
    expect(handleToggleRightPanel).toHaveBeenCalledTimes(1);

    rerender(
      <DrawerHeader
        title="Drawer"
        onClose={vi.fn()}
        collapsibleRightPanel={true}
        isRightPanelCollapsed={true}
        onToggleRightPanel={handleToggleRightPanel}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Mở rộng cột thông tin phải" }),
    ).toBeInTheDocument();
  });

  it("renders divider bar when onToggleEdit is present and isEditing=false", () => {
    const { rerender } = render(
      <DrawerHeader
        title="Drawer"
        onClose={vi.fn()}
        onToggleEdit={vi.fn()}
        isEditing={false}
      />,
    );

    expect(screen.getByTestId("v2-drawer-header-divider")).toBeInTheDocument();

    rerender(
      <DrawerHeader
        title="Drawer"
        onClose={vi.fn()}
        onToggleEdit={vi.fn()}
        isEditing={true}
      />,
    );
    expect(
      screen.queryByTestId("v2-drawer-header-divider"),
    ).not.toBeInTheDocument();
  });
});
