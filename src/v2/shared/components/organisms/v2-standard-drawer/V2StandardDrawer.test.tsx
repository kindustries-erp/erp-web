import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2StandardDrawer } from "./V2StandardDrawer";
import type { V2TabItemData } from "./V2StandardDrawer.type";

describe("V2StandardDrawer Organism", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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

  it("collapses and expands the right panel when chevron toggle is clicked", () => {
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

    expect(screen.getByTestId("collapsible-right")).toBeInTheDocument();
    const collapseBtn = screen.getByRole("button", {
      name: "Thu gọn cột thông tin phải",
    });
    fireEvent.click(collapseBtn);
    expect(screen.queryByTestId("collapsible-right")).not.toBeInTheDocument();

    const expandBtn = screen.getByRole("button", {
      name: "Mở rộng cột thông tin phải",
    });
    fireEvent.click(expandBtn);
    expect(screen.getByTestId("collapsible-right")).toBeInTheDocument();
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

  it("renders Mobile Bottom Sheet with grab handle when isMobile is true", () => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 375,
      height: 812,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    render(
      <V2StandardDrawer
        open={true}
        onClose={vi.fn()}
        title="Mobile Drawer"
        rightPanel={<div>Thông tin thêm mobile</div>}
      >
        <p>Nội dung mobile</p>
      </V2StandardDrawer>,
    );

    expect(screen.getByText("Mobile Drawer")).toBeInTheDocument();
    expect(screen.getByText("Nội dung mobile")).toBeInTheDocument();
    expect(screen.getByTestId("drawer-mobile-grab-handle")).toBeInTheDocument();
    expect(
      screen.getByTestId("drawer-mobile-stacked-panel"),
    ).toBeInTheDocument();
  });

  it("prompts V2ConfirmModal before closing when in edit mode with confirmOnClose=true", () => {
    const handleClose = vi.fn();
    render(
      <V2StandardDrawer
        open={true}
        onClose={handleClose}
        mode="edit"
        confirmOnClose={true}
        title="Đang Chỉnh Sửa"
      >
        <p>Form đang nhập dở</p>
      </V2StandardDrawer>,
    );

    const closeBtn = screen.getByRole("button", { name: "Close drawer" });
    fireEvent.click(closeBtn);

    expect(screen.getByText("Xác nhận đóng biểu mẫu")).toBeInTheDocument();
    expect(handleClose).not.toHaveBeenCalled();

    const confirmBtn = screen.getByRole("button", { name: "Đóng không lưu" });
    fireEvent.click(confirmBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders relatedTabs deck beneath content when provided", () => {
    render(
      <V2StandardDrawer
        open={true}
        onClose={vi.fn()}
        title="Drawer Với Related Deck"
        leftPanel={<div>Thông tin chính</div>}
        relatedTabs={[
          {
            key: "timeline",
            label: "Dòng Thời Gian",
            badgeCount: 3,
            content: <div data-testid="timeline-content">Timeline items</div>,
          },
        ]}
      />,
    );

    expect(screen.getByText("Thông tin chính")).toBeInTheDocument();
    expect(screen.getByText("Dòng Thời Gian")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByTestId("timeline-content")).toBeInTheDocument();
  });

  it("renders loading spinner and error banner correctly", () => {
    const { rerender } = render(
      <V2StandardDrawer
        open={true}
        onClose={vi.fn()}
        title="Loading State"
        loading={true}
      />,
    );

    expect(screen.getByText("Đang tải dữ liệu...")).toBeInTheDocument();

    rerender(
      <V2StandardDrawer
        open={true}
        onClose={vi.fn()}
        title="Error State"
        loading={false}
        error="Không thể kết nối đến máy chủ"
      />,
    );

    expect(
      screen.getByText("Không thể kết nối đến máy chủ"),
    ).toBeInTheDocument();
  });

  it("renders actionGroups dropdown in Drawer footer", () => {
    const handleSync = vi.fn();
    render(
      <V2StandardDrawer
        open={true}
        onClose={vi.fn()}
        title="Drawer with Action Groups"
        actionGroups={[
          {
            groupLabel: "ĐỒNG BỘ",
            items: [
              {
                label: "Đồng bộ từ GDT",
                onClick: handleSync,
              },
            ],
          },
        ]}
      />,
    );

    const triggerBtn = screen.getByRole("button", { name: "Thao tác" });
    expect(triggerBtn).toBeInTheDocument();
    expect(triggerBtn).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("renders leftTabs and rightTabs sub tab bars correctly", () => {
    const onLeftTabChange = vi.fn();
    render(
      <V2StandardDrawer
        open={true}
        onClose={vi.fn()}
        title="Drawer with Sub Tabs"
        layout="2-columns"
        leftTabs={[
          { key: "detail", label: "Chi tiết" },
          { key: "target", label: "Chi tiết theo đối tượng", badgeCount: 20 },
        ]}
        onLeftTabChange={onLeftTabChange}
        leftTabExtra={<button type="button">Xem trước HĐ</button>}
        rightTabs={[{ key: "info", label: "Thông tin chung" }]}
        rightPanel={<div>Nội dung cột phải</div>}
      />,
    );

    expect(screen.getByRole("tab", { name: /Chi tiết$/i })).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("Xem trước HĐ")).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Thông tin chung/i }),
    ).toBeInTheDocument();
  });
});
