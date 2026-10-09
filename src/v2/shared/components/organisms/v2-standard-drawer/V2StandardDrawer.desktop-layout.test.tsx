import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2StandardDrawer } from "./V2StandardDrawer";
import { resetDrawerStack } from "./v2DrawerStack";
import type { V2TabItemData } from "./V2StandardDrawer.type";

describe("V2StandardDrawer Organism - Desktop layout", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetDrawerStack();
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1440,
      height: 900,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
  });

  it("renders Desktop 2-columns drawer with title, badge, panels, and actions", () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();

    render(
      <V2StandardDrawer
        open={true}
        onClose={handleClose}
        title="Phiếu Nhập Kho NK-001"
        titleExtra={<span data-testid="status-badge">Đã duyệt</span>}
        subtitle="Chi nhánh chính"
        leftPanel={<div data-testid="left-panel">Nội dung phiếu kho</div>}
        rightPanel={<div data-testid="right-panel">Thông tin đối tác</div>}
        actions={[
          { label: "Lưu thay đổi", onClick: handleSave, primary: true },
        ]}
      />,
    );

    expect(screen.getByText("Phiếu Nhập Kho NK-001")).toBeInTheDocument();
    expect(screen.getByTestId("status-badge")).toBeInTheDocument();
    expect(screen.getByText("Chi nhánh chính")).toBeInTheDocument();
    expect(screen.getByTestId("left-panel")).toBeInTheDocument();
    expect(screen.getByTestId("right-panel")).toBeInTheDocument();

    const saveBtn = screen.getByRole("button", { name: "Lưu thay đổi" });
    fireEvent.click(saveBtn);
    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it("triggers onToggleEdit when edit button is clicked in view mode", () => {
    const handleToggleEdit = vi.fn();
    render(
      <V2StandardDrawer
        open={true}
        onClose={vi.fn()}
        mode="view"
        onToggleEdit={handleToggleEdit}
        title="Xem Chi Tiết"
      >
        <p>Thân drawer</p>
      </V2StandardDrawer>,
    );

    const editBtn = screen.getByRole("button", {
      name: "Chuyển sang chế độ chỉnh sửa",
    });
    fireEvent.click(editBtn);
    expect(handleToggleEdit).toHaveBeenCalledTimes(1);
  });

  it("collapses and expands the right panel with smooth animation classes when chevron toggle is clicked", () => {
    render(
      <V2StandardDrawer
        open={true}
        onClose={vi.fn()}
        title="Kiểm tra Cột Phải"
        layout="2-columns"
        collapsibleRightPanel={true}
        leftPanel={<div>Bên trái</div>}
        rightPanel={<div data-testid="collapsible-right">Bên phải</div>}
      />,
    );

    const rightPanelContainer = screen.getByTestId(
      "drawer-desktop-right-panel",
    );
    expect(rightPanelContainer).toBeInTheDocument();
    expect(rightPanelContainer).toHaveAttribute("aria-hidden", "false");
    expect(rightPanelContainer).toHaveClass("opacity-100");

    const collapseBtn = screen.getByRole("button", {
      name: "Thu gọn cột thông tin phải",
    });
    fireEvent.click(collapseBtn);
    expect(rightPanelContainer).toHaveAttribute("aria-hidden", "true");
    expect(rightPanelContainer).toHaveClass("opacity-0");
    expect(rightPanelContainer).toHaveClass("w-0");

    const expandBtn = screen.getByRole("button", {
      name: "Mở rộng cột thông tin phải",
    });
    fireEvent.click(expandBtn);
    expect(rightPanelContainer).toHaveAttribute("aria-hidden", "false");
    expect(rightPanelContainer).toHaveClass("opacity-100");
  });

  it("supports children as a render prop function receiving active tab context", () => {
    const mockTabs: V2TabItemData[] = [
      { key: "overview", label: "Tổng quan" },
      { key: "history", label: "Lịch sử" },
    ];

    render(
      <V2StandardDrawer
        open={true}
        onClose={vi.fn()}
        title="Render Props Drawer"
        tabs={mockTabs}
      >
        {({ activeTabKey }) => (
          <div data-testid="dynamic-content">
            {activeTabKey === "overview"
              ? "Nội dung Tổng quan"
              : "Nội dung Lịch sử"}
          </div>
        )}
      </V2StandardDrawer>,
    );

    expect(screen.getByText("Nội dung Tổng quan")).toBeInTheDocument();

    const historyTab = screen.getByRole("tab", { name: /Lịch sử/i });
    fireEvent.click(historyTab);
    expect(screen.getByText("Nội dung Lịch sử")).toBeInTheDocument();
  });

  it("switches top navigation tabs rendered via V2TabBar", () => {
    const mockTabs: V2TabItemData[] = [
      { key: "details", label: "Chi Tiết", content: <div>Nội dung Tab 1</div> },
      { key: "graph", label: "Biểu Đồ", content: <div>Nội dung Tab 2</div> },
    ];

    render(
      <V2StandardDrawer
        open={true}
        onClose={vi.fn()}
        title="Chứng Từ Đa Góc Nhìn"
        tabs={mockTabs}
        rightPanel={<div data-testid="tab-right-panel">Cột thông tin</div>}
      />,
    );

    expect(screen.getByText("Nội dung Tab 1")).toBeInTheDocument();
    expect(screen.getByTestId("tab-right-panel")).toBeInTheDocument();

    const graphTab = screen.getByRole("tab", { name: /Biểu Đồ/i });
    fireEvent.click(graphTab);
    expect(screen.getByText("Nội dung Tab 2")).toBeInTheDocument();
  });
});
