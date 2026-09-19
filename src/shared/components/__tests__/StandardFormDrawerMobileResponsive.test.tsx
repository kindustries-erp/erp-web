import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  StandardFormDrawer,
  type DrawerTopTabItem,
} from "../StandardFormDrawer";
import { DrawerSection, DrawerRow, DrawerField } from "../DrawerModal";

// Mock useT — returns identity function
vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => fallback || key,
}));

describe("StandardFormDrawer Mobile Responsive UI", () => {
  it("applies responsive fluid SIZE_CLASS with min-w-0 on mobile and lg:min-w desktop constraints", () => {
    const { baseElement, rerender } = render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Mobile Responsive Drawer"
        size="xl"
        leftPanel={<div>Main Content</div>}
      />,
    );

    let panel = baseElement.querySelector(".slide-panel");
    expect(panel).toBeInTheDocument();
    // Verify fluid mobile classes
    expect(panel).toHaveClass("w-full");
    expect(panel).toHaveClass("min-w-0");
    expect(panel).toHaveClass("max-w-full");
    // Verify desktop bounded classes
    expect(panel).toHaveClass("lg:min-w-[1020px]");
    expect(panel).toHaveClass("lg:max-w-[1780px]");
    expect(panel).toHaveClass("lg:w-[93vw]");

    // Check size 'sm'
    rerender(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Mobile Responsive Drawer"
        size="sm"
        leftPanel={<div>Main Content</div>}
      />,
    );
    panel = baseElement.querySelector(".slide-panel");
    expect(panel).toHaveClass("w-full");
    expect(panel).toHaveClass("min-w-0");
    expect(panel).toHaveClass("lg:min-w-[420px]");
    expect(panel).toHaveClass("lg:max-w-[660px]");
  });

  it("hides fullscreen toggle button on mobile viewport using hidden lg:inline-flex", () => {
    render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="2-Columns Drawer"
        layout="2-columns"
        leftPanel={<div>Left Panel</div>}
        rightPanel={<div>Right Panel</div>}
      />,
    );

    const fullscreenBtn = screen.getByTitle("Fullscreen");
    expect(fullscreenBtn).toBeInTheDocument();
    expect(fullscreenBtn).toHaveClass("hidden");
    expect(fullscreenBtn).toHaveClass("lg:inline-flex");
  });

  it("renders responsive body padding p-3 sm:p-4 md:p-[18px]", () => {
    const { baseElement } = render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Body Padding Test"
        leftPanel={<div>Body Content</div>}
      />,
    );

    const bodyContainer = baseElement.querySelector(
      ".slide-panel > div.flex-1.overflow-y-auto > div",
    );
    expect(bodyContainer).toHaveClass("p-3");
    expect(bodyContainer).toHaveClass("sm:p-4");
    expect(bodyContainer).toHaveClass("md:p-[18px]");
  });

  it("renders responsive top tab bar with synchronized negative margins and touch-pan-x", () => {
    const tabs: DrawerTopTabItem[] = [
      {
        key: "tab1",
        label: "Chi tiết",
        content: <div>Nội dung tab 1</div>,
      },
      {
        key: "tab2",
        label: "Lịch sử",
        content: <div>Nội dung tab 2</div>,
      },
    ];

    const { baseElement } = render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Top Tabs Test"
        tabs={tabs}
      />,
    );

    const tabBar = baseElement.querySelector(
      ".slide-panel div.sticky.top-0.z-10",
    );
    expect(tabBar).toBeInTheDocument();
    expect(tabBar).toHaveClass("-mx-3");
    expect(tabBar).toHaveClass("sm:-mx-4");
    expect(tabBar).toHaveClass("md:-mx-[18px]");

    const tabList = tabBar?.querySelector(".touch-pan-x");
    expect(tabList).toBeInTheDocument();
    expect(tabList).toHaveClass("overflow-x-auto");
    expect(tabList).toHaveClass("scrollbar-none");
  });

  it("renders DrawerSection and DrawerRow with responsive mobile-first classes", () => {
    render(
      <DrawerSection title="Thông tin phiếu" fitViewportHeight>
        <DrawerRow label="Mã phiếu" value="NK-2026-001" />
        <DrawerField label="Ghi chú">
          <input data-testid="field-input" />
        </DrawerField>
      </DrawerSection>,
    );

    const section = screen.getByText("Thông tin phiếu").closest(".rounded-xl");
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass("max-h-none");
    expect(section).toHaveClass("lg:max-h-[calc(100vh-210px)]");

    const row = screen.getByText("Mã phiếu").closest(".border-b");
    expect(row).toHaveClass("flex-col");
    expect(row).toHaveClass("sm:flex-row");
    expect(row).toHaveClass("sm:justify-between");
  });

  it("renders responsive footer with flex-wrap and safe-area padding", () => {
    const { baseElement } = render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Footer Test"
        leftPanel={<div>Content</div>}
        actions={[
          { label: "Đóng", onClick: () => {} },
          { label: "Lưu", primary: true, onClick: () => {} },
        ]}
      />,
    );

    const footer = baseElement.querySelector(
      ".slide-panel div.table-footer-glass",
    );
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass("flex-wrap");
    expect(footer).toHaveClass("sm:flex-nowrap");
    expect(footer).toHaveClass("px-3");
    expect(footer).toHaveClass("sm:px-5");
  });
});
