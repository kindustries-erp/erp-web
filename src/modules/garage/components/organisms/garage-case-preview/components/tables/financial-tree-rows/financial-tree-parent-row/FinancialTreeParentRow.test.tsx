import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FinancialTreeParentRow } from "./FinancialTreeParentRow";
import type { FinancialTreeItem } from "../FinancialTree.type";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, opts?: any) => {
      if (typeof opts === "string") return opts;
      if (opts && typeof opts === "object" && opts.defaultValue) {
        return typeof opts.defaultValue === "string" ? opts.defaultValue : k;
      }
      return k;
    },
  }),
}));

describe("FinancialTreeParentRow", () => {
  const revenueParentItem: FinancialTreeItem = {
    id: "receivable_total",
    rowType: "PARENT_TARGET",
    direction: "REVENUE",
    title: "Tổng phải thu vụ việc",
    iconType: "TARGET_REVENUE",
    targetAmount: 1296000,
    amount: 1296000,
    settledAmount: 296000,
    remainingAmount: 1000000,
    percentOfTotal: 100,
  };

  const costParentItem: FinancialTreeItem = {
    id: "cost_total",
    rowType: "PARENT_TARGET",
    direction: "COST",
    title: "Tổng chi phí vụ việc",
    iconType: "TARGET_COST",
    targetAmount: 1200000,
    amount: 1200000,
    settledAmount: 500000,
    remainingAmount: 700000,
    percentOfTotal: 100,
  };

  it("renders revenue parent row with title, target amount, and collect button", () => {
    const onCollect = vi.fn();
    render(
      <FinancialTreeParentRow
        item={revenueParentItem}
        childCount={2}
        onCollect={onCollect}
      />,
    );

    expect(screen.getByText("Tổng phải thu vụ việc")).toBeInTheDocument();
    expect(screen.getByText("(2 cấn trừ)")).toBeInTheDocument();
    expect(screen.getByText("1.296.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("100.0%")).toBeInTheDocument();

    const btn = screen.getByRole("button", { name: /Thu tiền/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onCollect).toHaveBeenCalledTimes(1);
  });

  it("renders separate KH and BH buttons when hasInsurance is true", () => {
    const onCollectKH = vi.fn();
    const onCollectBH = vi.fn();

    render(
      <FinancialTreeParentRow
        item={revenueParentItem}
        childCount={1}
        hasInsurance={true}
        onCollectKH={onCollectKH}
        onCollectBH={onCollectBH}
      />,
    );

    const btnKH = screen.getByRole("button", { name: /Thu KH/i });
    const btnBH = screen.getByRole("button", { name: /Thu BH/i });

    expect(btnKH).toBeInTheDocument();
    expect(btnBH).toBeInTheDocument();

    fireEvent.click(btnKH);
    expect(onCollectKH).toHaveBeenCalledTimes(1);

    fireEvent.click(btnBH);
    expect(onCollectBH).toHaveBeenCalledTimes(1);
  });

  it("renders cost parent row with pay button", () => {
    const onPay = vi.fn();
    render(
      <FinancialTreeParentRow
        item={costParentItem}
        childCount={1}
        onPay={onPay}
      />,
    );

    expect(screen.getByText("Tổng chi phí vụ việc")).toBeInTheDocument();
    expect(screen.getByText("1.200.000 ₫")).toBeInTheDocument();

    const btn = screen.getByRole("button", { name: /Chi tiền/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onPay).toHaveBeenCalledTimes(1);
  });
});
