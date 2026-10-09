import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2StandardDrawer } from "./V2StandardDrawer";
import { resetDrawerStack } from "./v2DrawerStack";

describe("V2StandardDrawer Organism - Mobile", () => {
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

  it("applies mobile vertical card stack with top offset and dimmed underlying sheet", () => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 375,
      height: 812,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    render(
      <>
        <V2StandardDrawer
          id="m1"
          open={true}
          onClose={vi.fn()}
          title="Mobile Parent"
          panelClassName="mobile-d1"
        >
          <div>Parent Mobile</div>
        </V2StandardDrawer>
        <V2StandardDrawer
          id="m2"
          open={true}
          onClose={vi.fn()}
          title="Mobile Child"
          panelClassName="mobile-d2"
        >
          <div>Child Mobile</div>
        </V2StandardDrawer>
      </>,
    );

    const mobile1 = document.querySelector(".mobile-d1");
    const mobile2 = document.querySelector(".mobile-d2");

    expect(mobile1).toHaveClass("scale-[0.97]");
    expect(mobile1).toHaveClass("opacity-85");
    expect(mobile2).toHaveStyle({
      zIndex: "60",
      top: "calc(env(safe-area-inset-top, 0px) + 16px)",
    });
  });
});
