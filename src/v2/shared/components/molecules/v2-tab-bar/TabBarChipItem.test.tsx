import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { TabBarChipItem } from "./TabBarChipItem";
import type { V2TabItemData } from "./V2TabBar.type";

describe("TabBarChipItem", () => {
  const tab: V2TabItemData = {
    key: "IN_STOCK",
    label: "Còn hàng",
    badgeCount: 55,
    tone: "success",
  };

  it("renders label, count badge and active state", () => {
    render(<TabBarChipItem tab={tab} isActive total={69} onSelect={vi.fn()} />);
    const btn = screen.getByRole("tab", { name: /Còn hàng/ });
    expect(btn).toHaveAttribute("aria-selected", "true");
    expect(btn).toHaveAttribute("data-active", "true");
    expect(screen.getByText("55")).toBeInTheDocument();
  });

  it("applies the tone dot colour", () => {
    const { container } = render(
      <TabBarChipItem
        tab={tab}
        isActive={false}
        total={69}
        onSelect={vi.fn()}
      />,
    );
    expect(container.querySelector('[data-tone="success"]')).not.toBeNull();
  });

  it("shows 0 as a KPI value and an empty progress bar", () => {
    render(
      <TabBarChipItem
        tab={{ ...tab, badgeCount: 0 }}
        isActive={false}
        total={69}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("sizes the progress bar relative to the total", () => {
    render(
      <TabBarChipItem
        tab={tab}
        isActive={false}
        total={110}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
  });

  it("calls onSelect with the key on click", () => {
    const onSelect = vi.fn();
    render(
      <TabBarChipItem
        tab={tab}
        isActive={false}
        total={69}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: /Còn hàng/ }));
    expect(onSelect).toHaveBeenCalledWith("IN_STOCK");
  });

  it("does not call onSelect when disabled", () => {
    const onSelect = vi.fn();
    render(
      <TabBarChipItem
        tab={{ ...tab, disabled: true }}
        isActive={false}
        total={69}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: /Còn hàng/ }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
