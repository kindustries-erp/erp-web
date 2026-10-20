import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FinancialTreeChildRow } from "./FinancialTreeChildRow";
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

describe("FinancialTreeChildRow", () => {
  const baseItem: FinancialTreeItem = {
    id: "inv-1",
    rowType: "CHILD_ITEM",
    direction: "REVENUE",
    title: "HĐ Đầu ra #375",
    iconType: "INVOICE",
    amount: 1000000,
    percentOfTotal: 77.2,
    partnerName: "Công ty ABC",
    isPending: true,
  };

  it("renders invoice child row with title, partner, amount, percentage, and pending badge", () => {
    render(<FinancialTreeChildRow item={baseItem} />);

    expect(screen.getByText("HĐ Đầu ra #375")).toBeInTheDocument();
    expect(screen.getByText("(Công ty ABC)")).toBeInTheDocument();
    expect(screen.getByText("1.000.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("77.2%")).toBeInTheDocument();
    expect(screen.getByText("Chờ lưu")).toBeInTheDocument();
  });

  it("calls onRemove when delete button is clicked in edit mode", () => {
    const onRemove = vi.fn();
    render(
      <FinancialTreeChildRow
        item={baseItem}
        canRemove={true}
        onRemove={onRemove}
      />,
    );

    const deleteBtn = screen.getByRole("button");
    expect(deleteBtn).toBeInTheDocument();
    expect(deleteBtn).not.toBeDisabled();
    fireEvent.click(deleteBtn);
    expect(onRemove).toHaveBeenCalledWith(baseItem);
  });

  it("renders disabled delete button with tooltip when canRemove is false", () => {
    const onRemove = vi.fn();
    render(
      <FinancialTreeChildRow
        item={baseItem}
        canRemove={false}
        disabledReason="Cần bật Chế độ chỉnh sửa để thao tác."
        onRemove={onRemove}
      />,
    );

    const deleteBtn = screen.getByRole("button");
    expect(deleteBtn).toBeInTheDocument();
    expect(deleteBtn).toBeDisabled();
    expect(deleteBtn).toHaveAttribute(
      "title",
      "Cần bật Chế độ chỉnh sửa để thao tác.",
    );
    fireEvent.click(deleteBtn);
    expect(onRemove).not.toHaveBeenCalled();
  });
});
