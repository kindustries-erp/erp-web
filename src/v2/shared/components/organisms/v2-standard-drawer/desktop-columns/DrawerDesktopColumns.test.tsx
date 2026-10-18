import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DrawerDesktopColumns } from "./DrawerDesktopColumns";
import type { useStandardDrawer } from "../hooks/V2StandardDrawer.hook";
import type { V2StandardDrawerProps } from "../V2StandardDrawer.type";

type DrawerHook = ReturnType<typeof useStandardDrawer>;

/** Trạng thái hook tối thiểu để kiểm tra bố cục hai cột */
const hookState = {
  effectiveLayout: "2-columns",
  isRightPanelCollapsed: false,
  activeTabItem: undefined,
  activeTabKey: "main",
  activeLeftTabKey: "",
  handleLeftTabChange: () => {},
  activeRightTabKey: "",
  handleRightTabChange: () => {},
  activeRightTabItem: undefined,
} as unknown as DrawerHook;

describe("DrawerDesktopColumns", () => {
  it("renders the main content only when there is no right panel", () => {
    render(
      <DrawerDesktopColumns
        props={{} as V2StandardDrawerProps}
        h={hookState}
        mainContent={<p>Nội dung chính</p>}
      />,
    );
    expect(screen.getByText("Nội dung chính")).toBeInTheDocument();
    expect(
      screen.queryByTestId("drawer-desktop-right-panel"),
    ).not.toBeInTheDocument();
  });

  it("renders the right panel beside the main content in 2-column layout", () => {
    render(
      <DrawerDesktopColumns
        props={{ rightPanel: <p>Bảng bên phải</p> } as V2StandardDrawerProps}
        h={hookState}
        mainContent={<p>Nội dung chính</p>}
      />,
    );
    expect(screen.getByText("Nội dung chính")).toBeInTheDocument();
    expect(screen.getByTestId("drawer-desktop-right-panel")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
  });

  it("hides the right panel when it is collapsed", () => {
    render(
      <DrawerDesktopColumns
        props={{ rightPanel: <p>Bảng bên phải</p> } as V2StandardDrawerProps}
        h={{ ...hookState, isRightPanelCollapsed: true } as DrawerHook}
        mainContent={<p>Nội dung chính</p>}
      />,
    );
    expect(screen.getByTestId("drawer-desktop-right-panel")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
