import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { V2TabBar } from "./V2TabBar";
import type { V2TabItemData } from "./V2TabBar.type";

describe("V2TabBar Molecule", () => {
  const mockTabs: V2TabItemData[] = [
    { key: "tab1", id: "tab1", label: "Chi tiết", badgeCount: 5 },
    { key: "tab2", id: "tab2", label: "Tài chính" },
    { key: "tab3", id: "tab3", label: "Chứng từ", disabled: true },
  ];

  it("renders variant='header' with dark active pill and badge", () => {
    const handleSelect = vi.fn();
    render(
      <V2TabBar
        variant="header"
        tabs={mockTabs}
        activeTabKey="tab1"
        onTabSelect={handleSelect}
        extra={<button type="button">ExtraAction</button>}
      />,
    );

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByText("Chi tiết")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("ExtraAction")).toBeInTheDocument();

    const tab2 = screen.getByText("Tài chính");
    fireEvent.click(tab2);
    expect(handleSelect).toHaveBeenCalledWith("tab2");

    // Disabled tab should not trigger callback
    const tab3 = screen.getByText("Chứng từ");
    fireEvent.click(tab3);
    expect(handleSelect).not.toHaveBeenCalledWith("tab3");
  });

  it("renders variant='sub' with segmented container", () => {
    const handleChange = vi.fn();
    render(
      <V2TabBar
        variant="sub"
        tabs={mockTabs}
        activeTabKey="tab2"
        onTabChange={handleChange}
      />,
    );

    expect(screen.getByText("Chi tiết")).toBeInTheDocument();
    const tab1 = screen.getByText("Chi tiết");
    fireEvent.click(tab1);
    expect(handleChange).toHaveBeenCalledWith("tab1");
  });

  it("renders variant='app' with closable tabs", () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();
    render(
      <V2TabBar
        variant="app"
        tabs={[
          { id: "app1", label: "Tab App 1", isClosable: true },
          { id: "app2", label: "Tab App 2", isClosable: false },
        ]}
        activeTabId="app1"
        onTabSelect={handleSelect}
        onTabClose={handleClose}
      />,
    );

    expect(screen.getByText("Tab App 1")).toBeInTheDocument();
    expect(screen.getByTestId("v2-tab-bar")).toBeInTheDocument();

    const tab2 = screen.getByText("Tab App 2");
    fireEvent.click(tab2);
    expect(handleSelect).toHaveBeenCalledWith("app2");
  });
});
