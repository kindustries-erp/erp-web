import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DrawerTopTabBar } from "./DrawerTopTabBar";
import type { DrawerTopTabItem } from "./DrawerTopTabBar.type";

const MOCK_TABS: DrawerTopTabItem[] = [
  {
    key: "details",
    label: "Chi Tiết",
    content: <div>Nội dung chi tiết</div>,
  },
  {
    key: "financials",
    label: "Tài Chính",
    badgeCount: 3,
    content: <div>Nội dung tài chính</div>,
  },
  {
    key: "history",
    label: "Lịch Sử",
    badgeCount: 0,
    content: <div>Lịch sử thao tác</div>,
  },
];

describe("V2 DrawerTopTabBar Molecule", () => {
  it("renders all tabs with labels and badges", () => {
    const handleChange = vi.fn();
    render(
      <DrawerTopTabBar
        tabs={MOCK_TABS}
        activeTabKey="details"
        onTabChange={handleChange}
      />,
    );

    expect(screen.getByText("Chi Tiết")).toBeInTheDocument();
    expect(screen.getByText("Tài Chính")).toBeInTheDocument();
    expect(screen.getByText("Lịch Sử")).toBeInTheDocument();
    // Badge 3 should be displayed
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("marks active tab with aria-selected=true", () => {
    render(
      <DrawerTopTabBar
        tabs={MOCK_TABS}
        activeTabKey="financials"
        onTabChange={vi.fn()}
      />,
    );

    const financialsTab = screen.getByRole("tab", { name: /Tài Chính/i });
    expect(financialsTab).toHaveAttribute("aria-selected", "true");

    const detailsTab = screen.getByRole("tab", { name: /Chi Tiết/i });
    expect(detailsTab).toHaveAttribute("aria-selected", "false");
  });

  it("calls onTabChange when a tab is clicked", () => {
    const handleChange = vi.fn();
    render(
      <DrawerTopTabBar
        tabs={MOCK_TABS}
        activeTabKey="details"
        onTabChange={handleChange}
      />,
    );

    const historyTab = screen.getByRole("tab", { name: /Lịch Sử/i });
    fireEvent.click(historyTab);
    expect(handleChange).toHaveBeenCalledWith("history");
  });

  it("returns null when tabs array has less than 2 items", () => {
    const { container } = render(
      <DrawerTopTabBar
        tabs={[MOCK_TABS[0]]}
        activeTabKey="details"
        onTabChange={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});
