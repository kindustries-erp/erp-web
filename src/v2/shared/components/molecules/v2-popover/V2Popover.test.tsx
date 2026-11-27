import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useState } from "react";
import { V2Popover, AppPopover } from "./V2Popover";
import * as useViewportModule from "@/v2/shared/hooks/useViewport";

function ControlledPopoverWrapper({
  title = "Tiêu đề Popup",
  content = "Nội dung kiểm thử Popover",
}: {
  title?: string;
  content?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <V2Popover
      open={open}
      onOpenChange={setOpen}
      title={title}
      content={<div data-testid="popover-inner-content">{content}</div>}
      trigger={<button type="button">Mở Popover</button>}
    />
  );
}

describe("V2Popover Molecule", () => {
  it("renders Desktop popover and toggles content on trigger click", () => {
    vi.spyOn(useViewportModule, "useViewport").mockReturnValue({
      width: 1280,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    render(<ControlledPopoverWrapper />);
    const trigger = screen.getByText("Mở Popover");
    expect(trigger).toBeInTheDocument();
    expect(
      screen.queryByTestId("popover-inner-content"),
    ).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByTestId("popover-inner-content")).toBeInTheDocument();
    expect(screen.getByText("Tiêu đề Popup")).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: "Đóng popover" });
    fireEvent.click(closeBtn);
    expect(
      screen.queryByTestId("popover-inner-content"),
    ).not.toBeInTheDocument();
  });

  it("renders Mobile Bottom Sheet when isMobile is true", () => {
    vi.spyOn(useViewportModule, "useViewport").mockReturnValue({
      width: 375,
      height: 667,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    render(<ControlledPopoverWrapper />);
    const trigger = screen.getByText("Mở Popover");
    fireEvent.click(trigger);

    expect(screen.getByTestId("popover-inner-content")).toBeInTheDocument();
    expect(
      screen.getByTestId("v2-popover-mobile-grab-handle"),
    ).toBeInTheDocument();
    expect(screen.getByText("Tiêu đề Popup")).toBeInTheDocument();
  });

  it("keeps full width on mobile even when caller passes narrow width className", () => {
    vi.spyOn(useViewportModule, "useViewport").mockReturnValue({
      width: 375,
      height: 667,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    render(
      <V2Popover
        open
        onOpenChange={vi.fn()}
        title="Rộng đầy đủ"
        className="w-64 p-1"
        content={<div>Nội dung</div>}
        trigger={<button type="button">Trigger</button>}
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("w-full");
    expect(dialog.className).toContain("max-w-none");
  });

  it("Desktop: wheel/touchmove trong popover không lan tới document (drawer modal không chặn cuộn)", () => {
    vi.spyOn(useViewportModule, "useViewport").mockReturnValue({
      width: 1280,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
    const onDocWheel = vi.fn();
    const onDocTouchMove = vi.fn();
    document.addEventListener("wheel", onDocWheel);
    document.addEventListener("touchmove", onDocTouchMove);

    try {
      render(
        <V2Popover
          open
          onOpenChange={vi.fn()}
          hideCloseButton
          content={
            <ul data-testid="scroll-list" className="max-h-60 overflow-y-auto">
              <li>Ngân hàng A</li>
            </ul>
          }
          trigger={<button type="button">Trigger</button>}
        />,
      );

      const list = screen.getByTestId("scroll-list");
      fireEvent.wheel(list, { deltaY: 120 });
      fireEvent.touchMove(list);

      expect(onDocWheel).not.toHaveBeenCalled();
      expect(onDocTouchMove).not.toHaveBeenCalled();

      // Đối chứng: sự kiện ngoài popover vẫn tới document.
      fireEvent.wheel(screen.getByText("Trigger"), { deltaY: 120 });
      expect(onDocWheel).toHaveBeenCalledTimes(1);
    } finally {
      document.removeEventListener("wheel", onDocWheel);
      document.removeEventListener("touchmove", onDocTouchMove);
    }
  });

  it("exports AppPopover as alias of V2Popover", () => {
    expect(AppPopover).toBe(V2Popover);
  });
});
