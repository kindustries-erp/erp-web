import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import {
  StandardFormDrawer,
  DrawerTopTabBar,
  type DrawerTopTabItem,
} from "../StandardFormDrawer";

describe("StandardFormDrawer Top Navigation Tabs", () => {
  it("renders DrawerTopTabBar with tabs, icons, and badge counts", () => {
    const tabs: DrawerTopTabItem[] = [
      {
        key: "tab1",
        label: "Chi tiết báo giá",
        badgeCount: 0,
        content: <div>Nội dung báo giá</div>,
      },
      {
        key: "tab2",
        label: "Tài chính & Công nợ",
        badgeCount: 3,
        content: <div>Nội dung tài chính</div>,
      },
    ];

    render(
      <DrawerTopTabBar
        tabs={tabs}
        activeTabKey="tab1"
        onTabChange={() => {}}
      />,
    );

    expect(screen.getByText("Chi tiết báo giá")).toBeInTheDocument();
    expect(screen.getByText("Tài chính & Công nợ")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("switches tab content when clicking different top tabs in StandardFormDrawer", async () => {
    const onTabChange = vi.fn();
    const tabs: DrawerTopTabItem[] = [
      {
        key: "tab1",
        label: "Tab 1: Báo giá",
        content: <div data-testid="tab1-content">Nội dung Báo giá</div>,
      },
      {
        key: "tab2",
        label: "Tab 2: Tài chính",
        content: <div data-testid="tab2-content">Nội dung Tài chính</div>,
      },
    ];

    render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Test Drawer"
        tabs={tabs}
        defaultTabKey="tab1"
        onTabChange={onTabChange}
      />,
    );

    expect(screen.getByTestId("tab1-content")).toBeInTheDocument();
    expect(screen.queryByTestId("tab2-content")).not.toBeInTheDocument();

    // Click Tab 2
    fireEvent.click(screen.getByText("Tab 2: Tài chính"));
    expect(onTabChange).toHaveBeenCalledWith("tab2");
    await waitFor(() => {
      expect(screen.getByTestId("tab2-content")).toBeInTheDocument();
      expect(screen.queryByTestId("tab1-content")).not.toBeInTheDocument();
    });
  });

  it("dynamically hides rightPanel when active tab has hideRightPanel: true", () => {
    const tabs: DrawerTopTabItem[] = [
      {
        key: "tab1",
        label: "Tab 1: Normal",
        content: <div>Normal Content</div>,
      },
      {
        key: "tab2",
        label: "Tab 2: Full Width Graph",
        hideRightPanel: true,
        content: <div>Full Width Content</div>,
      },
    ];

    render(
      <StandardFormDrawer
        open={true}
        mode="view"
        onClose={() => {}}
        title="Test Drawer"
        tabs={tabs}
        defaultTabKey="tab1"
        rightPanel={
          <div data-testid="right-panel-content">Metadata Sidebar</div>
        }
      />,
    );

    // In Tab 1: Right panel is visible
    expect(screen.getByTestId("right-panel-content")).toBeInTheDocument();

    // Switch to Tab 2: Right panel is hidden
    fireEvent.click(screen.getByText("Tab 2: Full Width Graph"));
    expect(screen.queryByTestId("right-panel-content")).not.toBeInTheDocument();

    // Switch back to Tab 1: Right panel appears again
    fireEvent.click(screen.getByText("Tab 1: Normal"));
    expect(screen.getByTestId("right-panel-content")).toBeInTheDocument();
  });
});
