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

  it("renders label, count badge and active state with active tab bar", () => {
    const { container } = render(
      <TabBarChipItem tab={tab} isActive total={69} onSelect={vi.fn()} />,
    );
    const btn = screen.getByRole("tab", { name: /Còn hàng/ });
    expect(btn).toHaveAttribute("aria-selected", "true");
    expect(btn).toHaveAttribute("data-active", "true");
    expect(screen.getByText("(55)")).toBeInTheDocument();
    expect(container.querySelector(".bg-primary")).not.toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
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

  it("shows 0 as a KPI value and an empty progress bar when indicator='progress'", () => {
    render(
      <TabBarChipItem
        tab={{ ...tab, badgeCount: 0 }}
        isActive={false}
        total={69}
        indicator="progress"
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("(0)")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("sizes the progress bar relative to the total when indicator='progress'", () => {
    render(
      <TabBarChipItem
        tab={tab}
        isActive={false}
        total={110}
        indicator="progress"
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

  it("renders subValue when no metrics are provided", () => {
    render(
      <TabBarChipItem
        tab={{
          ...tab,
          subValue: "95 cái",
        }}
        isActive={false}
        total={69}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("95 cái")).toBeInTheDocument();
  });

  it("renders custom metrics when provided", () => {
    render(
      <TabBarChipItem
        tab={{
          ...tab,
          metrics: [{ label: "Trị giá", value: "500k ₫", tone: "success" }],
        }}
        isActive={false}
        total={69}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("Trị giá: 500k ₫")).toBeInTheDocument();
    expect(
      screen.queryByTestId("tab-chip-metric-divider"),
    ).not.toBeInTheDocument();
  });

  it("renders multiple metrics centered with vertical divider in between", () => {
    const { container } = render(
      <TabBarChipItem
        tab={{
          ...tab,
          metrics: [
            { label: "Tồn", value: "257" },
            { label: "Trị giá", value: "99.28M ₫" },
          ],
        }}
        isActive={false}
        total={69}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("Tồn: 257")).toBeInTheDocument();
    expect(screen.getByText("Trị giá: 99.28M ₫")).toBeInTheDocument();
    expect(screen.getByTestId("tab-chip-metric-divider")).toBeInTheDocument();
    const metricsContainer = container.querySelector(".justify-center");
    expect(metricsContainer).not.toBeNull();
  });

  it("renders percentage and supports comfortable density", () => {
    const { container } = render(
      <TabBarChipItem
        tab={{ ...tab, percentage: 80 }}
        isActive={true}
        total={100}
        density="comfortable"
        onSelect={vi.fn()}
      />,
    );
    expect(container.querySelector('[data-active="true"]')).toBeInTheDocument();
    expect(screen.getByText("55")).toBeInTheDocument();
  });
});
