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

  it("supports size variants xs, sm, md, and lg", () => {
    const onValueChange = vi.fn();
    const { rerender, container } = render(
      <PillTabs
        value="tab1"
        onValueChange={onValueChange}
        items={sampleItems}
        size="xs"
      />,
    );

    const listXs = container.querySelector('[role="tablist"]');
    expect(listXs?.className).toContain("h-7");

    rerender(
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

  it("supports segmented and direction variants", () => {
    const directionItems: PillTabItem<"OUT" | "IN">[] = [
      {
        value: "OUT",
        label: "Phải thu",
        badgeCount: 288,
        accentColor: "emerald",
      },
      { value: "IN", label: "Phải trả", badgeCount: 320, accentColor: "amber" },
    ];

    const { rerender, container } = render(
      <PillTabs
        value="OUT"
        onValueChange={() => {}}
        items={directionItems}
        variant="direction"
        size="sm"
      />,
    );

    expect(screen.getByText("Phải thu")).toBeInTheDocument();
    expect(screen.getByText("Phải trả")).toBeInTheDocument();
    expect(screen.getByText("288")).toBeInTheDocument();

    rerender(
      <PillTabs
        value="tab1"
        onValueChange={() => {}}
        items={sampleItems}
        variant="segmented"
        size="sm"
      />,
    );

    const listSegmented = container.querySelector('[role="tablist"]');
    expect(listSegmented?.className).toContain("rounded-lg");
  });

  it("supports button-group variant and dot indicators", () => {
    const buttonGroupItems: PillTabItem<"template" | "pdf">[] = [
      { value: "template", label: "Xem trước HĐ thuần" },
      { value: "pdf", label: "File PDF", dot: true, dotColor: "emerald" },
    ];

    const onValueChange = vi.fn();
    const { container } = render(
      <PillTabs
        value="template"
        onValueChange={onValueChange}
        items={buttonGroupItems}
        variant="button-group"
        size="sm"
      />,
    );

    expect(screen.getByText("Xem trước HĐ thuần")).toBeInTheDocument();
    expect(screen.getByText("File PDF")).toBeInTheDocument();

    const list = container.querySelector('[role="tablist"]');
    expect(list?.className).toContain("bg-transparent");
  });
});
