import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2StandardDrawer } from "./V2StandardDrawer";
import { resetDrawerStack } from "./v2DrawerStack";

describe("V2StandardDrawer Organism - Desktop content", () => {
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

    const closeBtn = screen.getByRole("button", { name: /Close drawer|Đóng/i });
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

    expect(screen.getByText("Đang tải...")).toBeInTheDocument();

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
