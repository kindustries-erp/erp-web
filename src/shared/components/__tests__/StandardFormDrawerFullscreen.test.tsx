import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { StandardFormDrawer } from "../StandardFormDrawer";

// Mock useT
vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => fallback || key,
}));

describe("StandardFormDrawer Fullscreen Mode", () => {
  it("renders Fullscreen toggle button for 2-columns drawer", () => {
    render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Test Drawer 2-Cols"
        layout="2-columns"
        leftPanel={<div>Left Content</div>}
        rightPanel={<div>Right Content</div>}
      />,
    );

    const fullscreenBtn = screen.getByTitle("Fullscreen");
    expect(fullscreenBtn).toBeInTheDocument();
  });

  it("does not render Fullscreen button when layout is 1-column by default", () => {
    render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Test 1-Col"
        layout="1-column"
        leftPanel={<div>Simple Form</div>}
      />,
    );

    expect(screen.queryByTitle("Fullscreen")).not.toBeInTheDocument();
  });

  it("does not render Fullscreen button when enableFullscreen is false", () => {
    render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Test No Fullscreen"
        layout="2-columns"
        enableFullscreen={false}
        leftPanel={<div>Left</div>}
        rightPanel={<div>Right</div>}
      />,
    );

    expect(screen.queryByTitle("Fullscreen")).not.toBeInTheDocument();
  });

  it("toggles fullscreen mode and updates panel class when clicking the toggle button", () => {
    const onFullscreenChange = vi.fn();
    const { baseElement } = render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Test Toggle Fullscreen"
        layout="2-columns"
        size="lg"
        leftPanel={<div>Left Panel</div>}
        rightPanel={<div>Right Panel</div>}
        onFullscreenChange={onFullscreenChange}
      />,
    );

    const panel = baseElement.querySelector(".slide-panel");
    expect(panel).toBeInTheDocument();
    // Default size is lg
    expect(panel?.className).toContain("lg:w-[78vw]");

    // Click Fullscreen button
    const fullscreenBtn = screen.getByTitle("Fullscreen");
    fireEvent.click(fullscreenBtn);

    expect(onFullscreenChange).toHaveBeenCalledWith(true);
    // Now panel should have full size class and fullscreen-drawer class
    expect(panel?.className).toContain("fullscreen-drawer");
    expect(screen.getByTitle("Exit Fullscreen (Esc)")).toBeInTheDocument();

    // Click again to exit
    const exitBtn = screen.getByTitle("Exit Fullscreen (Esc)");
    fireEvent.click(exitBtn);

    expect(onFullscreenChange).toHaveBeenCalledWith(false);
    expect(panel?.className).not.toContain("fullscreen-drawer");
    expect(panel?.className).toContain("lg:w-[78vw]");
  });

  it("intercepts Escape key to exit fullscreen before closing drawer", () => {
    const onClose = vi.fn();
    const onFullscreenChange = vi.fn();

    const { baseElement } = render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={onClose}
        title="Test Esc Fullscreen"
        layout="2-columns"
        defaultFullscreen={true}
        leftPanel={<div>Left Panel</div>}
        rightPanel={<div>Right Panel</div>}
        onFullscreenChange={onFullscreenChange}
      />,
    );

    const panel = baseElement.querySelector(".slide-panel");
    expect(panel?.className).toContain("fullscreen-drawer");

    // Press Escape key while in fullscreen
    fireEvent.keyDown(window, { key: "Escape" });

    // Should exit fullscreen and NOT call onClose
    expect(onFullscreenChange).toHaveBeenCalledWith(false);
    expect(onClose).not.toHaveBeenCalled();
    expect(panel?.className).not.toContain("fullscreen-drawer");

    // Press Escape again when not in fullscreen -> should call onClose
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
