import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DrawerSubTabBar } from "./DrawerSubTabBar";
import type { DrawerSubTabItem } from "./DrawerSubTabBar.type";

const MOCK_SUB_TABS: DrawerSubTabItem[] = [
  { key: "detail", label: "Chi tiết" },
  { key: "target", label: "Chi tiết theo đối tượng", badgeCount: 20 },
  { key: "items", label: "Chi tiết HHDV" },
  { key: "trend", label: "Biến động & Phân tích", disabled: true },
];

describe("DrawerSubTabBar Molecule", () => {
  it("renders sub tabs with active state and badge", () => {
    const onTabChange = vi.fn();
    render(
      <DrawerSubTabBar
        tabs={MOCK_SUB_TABS}
        activeTabKey="detail"
        onTabChange={onTabChange}
        extra={<button type="button">Xem trước HĐ thuần</button>}
      />,
    );

    const activeTab = screen.getByRole("tab", { name: "Chi tiết" });
    expect(activeTab).toHaveAttribute("aria-selected", "true");

    const badge = screen.getByText("20");
    expect(badge).toBeInTheDocument();

    const extraBtn = screen.getByText("Xem trước HĐ thuần");
    expect(extraBtn).toBeInTheDocument();

    const targetTab = screen.getByRole("tab", {
      name: /Chi tiết theo đối tượng/,
    });
    fireEvent.click(targetTab);
    expect(onTabChange).toHaveBeenCalledWith("target");
  });

  it("does not trigger onTabChange when clicking disabled tab", () => {
    const onTabChange = vi.fn();
    render(
      <DrawerSubTabBar
        tabs={MOCK_SUB_TABS}
        activeTabKey="detail"
        onTabChange={onTabChange}
      />,
    );

    const disabledTab = screen.getByRole("tab", {
      name: "Biến động & Phân tích",
    });
    expect(disabledTab).toBeDisabled();
    fireEvent.click(disabledTab);
    expect(onTabChange).not.toHaveBeenCalled();
  });

  it("returns null when tabs array is empty", () => {
    const { container } = render(<DrawerSubTabBar tabs={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
