import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2StandardDrawer } from "../V2StandardDrawer";
import { resetDrawerStack } from "../utils/v2DrawerStack";

/**
 * Drawer trên (edit + confirmOnClose) mở chồng lên drawer dưới.
 * Hộp xác nhận đóng phải nằm trên cả hai drawer, nên bấm "Đóng không lưu" phải đóng được drawer trên.
 */
function renderStacked(onCloseTop: () => void, onCloseBottom: () => void) {
  return render(
    <>
      <V2StandardDrawer
        id="bottom"
        open={true}
        onClose={onCloseBottom}
        title="Drawer dưới"
      >
        <div>Nội dung dưới</div>
      </V2StandardDrawer>
      <V2StandardDrawer
        id="top"
        open={true}
        mode="edit"
        confirmOnClose={true}
        onClose={onCloseTop}
        title="Drawer trên"
        panelClassName="drawer-top-layer"
      >
        <div>Nội dung trên</div>
      </V2StandardDrawer>
    </>,
  );
}

describe("V2StandardDrawer Organism - xác nhận đóng khi xếp chồng", () => {
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

  it("hộp xác nhận nằm trên drawer đang xếp chồng", () => {
    renderStacked(vi.fn(), vi.fn());

    fireEvent.keyDown(document, { key: "Escape" });

    const confirmButton = screen.getByRole("button", {
      name: "Đóng không lưu",
    });
    const confirmDialog = confirmButton.closest('[role="dialog"]');
    expect(confirmDialog?.className).toContain("z-[700]");
    expect(document.querySelector(".z-\\[699\\]")).not.toBeNull();
  });

  it("bấm 'Đóng không lưu' đóng drawer trên, không đóng drawer dưới", () => {
    const onCloseTop = vi.fn();
    const onCloseBottom = vi.fn();
    renderStacked(onCloseTop, onCloseBottom);

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Đóng không lưu" }));

    expect(onCloseTop).toHaveBeenCalledTimes(1);
    expect(onCloseBottom).not.toHaveBeenCalled();
  });

  it("bấm 'Tiếp tục chỉnh sửa' giữ nguyên drawer trên", () => {
    const onCloseTop = vi.fn();
    renderStacked(onCloseTop, vi.fn());

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục chỉnh sửa" }));

    expect(onCloseTop).not.toHaveBeenCalled();
  });
});
