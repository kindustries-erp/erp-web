import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2StandardDrawer } from "../V2StandardDrawer";
import { resetDrawerStack } from "../utils/v2DrawerStack";

describe("V2StandardDrawer tab right panels", () => {
  beforeEach(() => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1440,
      height: 900,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
    resetDrawerStack();
  });

  it("uses the active tab panel and falls back to the drawer panel", () => {
    render(
      <V2StandardDrawer
        open
        onClose={vi.fn()}
        title="Panel theo tab"
        tabs={[
          {
            key: "details",
            label: "Chi tiết",
            rightPanel: <div data-testid="details-right">Panel chi tiết</div>,
          },
          { key: "history", label: "Lịch sử" },
        ]}
        rightPanel={<div data-testid="fallback-right">Panel mặc định</div>}
      >
        {({ activeTabKey }) => <p>{activeTabKey}</p>}
      </V2StandardDrawer>,
    );

    expect(screen.getByTestId("details-right")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Lịch sử" }));
    expect(screen.getByTestId("fallback-right")).toBeInTheDocument();
    expect(screen.queryByTestId("details-right")).not.toBeInTheDocument();
  });
});
