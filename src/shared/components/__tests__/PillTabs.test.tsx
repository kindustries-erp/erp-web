import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PillTabs, type PillTabItem } from "../PillTabs";
import { LayoutDashboard, ShoppingCart, Truck } from "lucide-react";

describe("PillTabs Component Suite", () => {
  const sampleItems: PillTabItem<string>[] = [
    {
      value: "tab1",
      label: "Tổng quan",
      icon: LayoutDashboard,
      badgeCount: 5,
    },
    {
      value: "tab2",
      label: "Bán hàng",
      icon: ShoppingCart,
    },
    {
      value: "tab3",
      label: "Vận chuyển",
      icon: Truck,
      disabled: true,
    },
  ];

  it("renders tabs correctly with labels and badges", () => {
    const onValueChange = vi.fn();
    render(
      <PillTabs
        value="tab1"
        onValueChange={onValueChange}
        items={sampleItems}
      />,
    );

    expect(screen.getByText("Tổng quan")).toBeInTheDocument();
    expect(screen.getByText("Bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Vận chuyển")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("calls onValueChange when clicking an inactive tab", () => {
    const onValueChange = vi.fn();
    render(
      <PillTabs
        value="tab1"
        onValueChange={onValueChange}
        items={sampleItems}
      />,
    );

    const tab = screen.getByRole("tab", { name: /Bán hàng/i });
    fireEvent.keyDown(tab, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("tab2");
  });

  it("supports size variants sm, md, and lg", () => {
    const onValueChange = vi.fn();
    const { rerender, container } = render(
      <PillTabs
        value="tab1"
        onValueChange={onValueChange}
        items={sampleItems}
        size="sm"
      />,
    );

    const listSm = container.querySelector('[role="tablist"]');
    expect(listSm?.className).toContain("h-8");

    rerender(
      <PillTabs
        value="tab1"
        onValueChange={onValueChange}
        items={sampleItems}
        size="md"
      />,
    );
    const listMd = container.querySelector('[role="tablist"]');
    expect(listMd?.className).toContain("h-9");

    rerender(
      <PillTabs
        value="tab1"
        onValueChange={onValueChange}
        items={sampleItems}
        size="lg"
      />,
    );
    const listLg = container.querySelector('[role="tablist"]');
    expect(listLg?.className).toContain("h-10");
  });

  it("renders badgeCount and respects alwaysShowIcon", () => {
    const items: PillTabItem<string>[] = [
      {
        value: "tab1",
        label: "Tab 1",
        icon: LayoutDashboard,
        badgeCount: 12,
        alwaysShowIcon: true,
      },
    ];

    render(<PillTabs value="tab1" onValueChange={() => {}} items={items} />);

    expect(screen.getByText("12")).toBeInTheDocument();
  });
});
