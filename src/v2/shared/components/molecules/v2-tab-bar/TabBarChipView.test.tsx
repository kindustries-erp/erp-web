import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { V2TabBar } from "./V2TabBar";
import { V2TabBarVariant, type V2TabItemData } from "./V2TabBar.type";

describe("V2TabBar variant STATUS_CHIP", () => {
  const tabs: V2TabItemData[] = [
    { key: "ALL", label: "Tất cả", badgeCount: 69, tone: "neutral" },
    { key: "IN_STOCK", label: "Còn hàng", badgeCount: 55, tone: "success" },
    { key: "NEGATIVE", label: "Tồn âm", tone: "warning" },
  ];

  it("renders a tablist of chips with the active tab selected", () => {
    render(
      <V2TabBar
        variant={V2TabBarVariant.STATUS_CHIP}
        tabs={tabs}
        activeTabKey="ALL"
        onTabSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByRole("tab", { name: /Tất cả/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("69")).toBeInTheDocument();
  });

  it("selects a tab on click and renders extra actions", () => {
    const onTabSelect = vi.fn();
    render(
      <V2TabBar
        variant={V2TabBarVariant.STATUS_CHIP}
        tabs={tabs}
        activeTabKey="ALL"
        onTabSelect={onTabSelect}
        extra={<button type="button">Làm mới</button>}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: /Tồn âm/ }));
    expect(onTabSelect).toHaveBeenCalledWith("NEGATIVE");
    expect(screen.getByText("Làm mới")).toBeInTheDocument();
  });
});
