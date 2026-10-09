import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2StandardDrawer } from "./V2StandardDrawer";
import { resetDrawerStack } from "./v2DrawerStack";

describe("V2StandardDrawer Organism - Desktop stack", () => {
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

  it("applies desktop cascading offset (-20px) and higher z-index when multiple drawers are open", () => {
    render(
      <>
        <V2StandardDrawer
          id="d1"
          open={true}
          onClose={vi.fn()}
          title="Drawer Tầng 1"
          panelClassName="drawer-layer-1"
        >
          <div>Nội dung 1</div>
        </V2StandardDrawer>
        <V2StandardDrawer
          id="d2"
          open={true}
          onClose={vi.fn()}
          title="Drawer Tầng 2"
          panelClassName="drawer-layer-2"
        >
          <div>Nội dung 2</div>
        </V2StandardDrawer>
      </>,
    );

    const layer1 = document.querySelector(".drawer-layer-1");
    const layer2 = document.querySelector(".drawer-layer-2");

    expect(layer1).toBeInTheDocument();
    expect(layer2).toBeInTheDocument();

    expect(layer1).toHaveStyle({ zIndex: "50" });
    expect(layer2).toHaveStyle({
      zIndex: "60",
      transform: "translateX(-20px)",
    });
  });

  it("closes only the topmost drawer when Escape key is pressed", () => {
    const handleClose1 = vi.fn();
    const handleClose2 = vi.fn();

    render(
      <>
        <V2StandardDrawer
          id="d1"
          open={true}
          onClose={handleClose1}
          title="Parent Drawer"
        >
          <div>Parent Content</div>
        </V2StandardDrawer>
        <V2StandardDrawer
          id="d2"
          open={true}
          onClose={handleClose2}
          title="Child Drawer"
        >
          <div>Child Content</div>
        </V2StandardDrawer>
      </>,
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(handleClose2).toHaveBeenCalledTimes(1);
    expect(handleClose1).not.toHaveBeenCalled();
  });

  it("does not apply stack offset when isFullscreen is true", () => {
    render(
      <>
        <V2StandardDrawer
          id="f1"
          open={true}
          onClose={vi.fn()}
          title="Root Drawer"
        >
          <div>Root</div>
        </V2StandardDrawer>
        <V2StandardDrawer
          id="f2"
          open={true}
          onClose={vi.fn()}
          title="Fullscreen Drawer"
          isFullscreen={true}
          panelClassName="fullscreen-d2"
        >
          <div>Child</div>
        </V2StandardDrawer>
      </>,
    );

    const fs = document.querySelector(".fullscreen-d2");
    expect(fs?.getAttribute("style")?.includes("translateX")).toBe(false);
  });
});
