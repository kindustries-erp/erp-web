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

  it("exports AppPopover as alias of V2Popover", () => {
    expect(AppPopover).toBe(V2Popover);
  });
});
