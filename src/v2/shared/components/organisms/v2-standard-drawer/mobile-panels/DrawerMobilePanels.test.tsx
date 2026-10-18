import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DrawerMobilePanels } from "./DrawerMobilePanels";
import type { useStandardDrawer } from "../hooks/V2StandardDrawer.hook";
import type { V2StandardDrawerProps } from "../V2StandardDrawer.type";

type DrawerHook = ReturnType<typeof useStandardDrawer>;

/** Trạng thái hook tối thiểu để kiểm tra các khối xếp dọc trên mobile */
const hookState = {
  activeTabItem: undefined,
  activeTabKey: "main",
  activeLeftTabKey: "",
  handleLeftTabChange: () => {},
  activeRightTabKey: "",
  handleRightTabChange: () => {},
  activeRightTabItem: undefined,
} as unknown as DrawerHook;

describe("DrawerMobilePanels", () => {
  it("renders main content and no stacked panel without a right panel", () => {
    render(
      <DrawerMobilePanels
        props={{} as V2StandardDrawerProps}
        h={hookState}
        mainContent={<p>Nội dung chính</p>}
        hasRelated={false}
      />,
    );
    expect(screen.getByText("Nội dung chính")).toBeInTheDocument();
    expect(
      screen.queryByTestId("drawer-mobile-stacked-panel"),
    ).not.toBeInTheDocument();
  });

  it("stacks the right panel under the main content", () => {
    render(
      <DrawerMobilePanels
        props={{ rightPanel: <p>Panel phụ</p> } as V2StandardDrawerProps}
        h={hookState}
        mainContent={<p>Nội dung chính</p>}
        hasRelated={false}
      />,
    );
    expect(screen.getByTestId("drawer-mobile-stacked-panel")).toHaveTextContent(
      "Panel phụ",
    );
  });

  it("hides the stacked panel when the active tab hides the right panel", () => {
    render(
      <DrawerMobilePanels
        props={{ rightPanel: <p>Panel phụ</p> } as V2StandardDrawerProps}
        h={
          {
            ...hookState,
            activeTabItem: { hideRightPanel: true },
          } as unknown as DrawerHook
        }
        mainContent={<p>Nội dung chính</p>}
        hasRelated={false}
      />,
    );
    expect(
      screen.queryByTestId("drawer-mobile-stacked-panel"),
    ).not.toBeInTheDocument();
  });
});
