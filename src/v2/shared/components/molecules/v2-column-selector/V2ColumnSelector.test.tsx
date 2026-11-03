import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2ColumnSelector } from "./V2ColumnSelector";
import type { V2ColumnSelectorGroup } from "./V2ColumnSelector.type";

const groups: V2ColumnSelectorGroup[] = [
  {
    key: "summary",
    label: "Tổng hợp",
    columns: [
      { key: "sku", label: "Mã" },
      { key: "qtyIn", label: "Nhập" },
    ],
  },
  {
    key: "ledger",
    label: "Sổ cái",
    columns: [{ key: "amount", label: "Thành tiền" }],
  },
];

describe("V2ColumnSelector", () => {
  it("toggles a single column and keeps declaration order", () => {
    const onChange = vi.fn();
    render(
      <V2ColumnSelector
        groups={groups}
        selectedKeys={["qtyIn"]}
        defaultKeys={["sku"]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Mã" }));
    expect(onChange).toHaveBeenLastCalledWith(["sku", "qtyIn"]);
  });

  it("selects every column of a group from the group checkbox", () => {
    const onChange = vi.fn();
    render(
      <V2ColumnSelector
        groups={groups}
        selectedKeys={[]}
        defaultKeys={["sku"]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Tổng hợp" }));
    expect(onChange).toHaveBeenLastCalledWith(["sku", "qtyIn"]);
  });

  it("restores default keys from the reset button", () => {
    const onChange = vi.fn();
    render(
      <V2ColumnSelector
        groups={groups}
        selectedKeys={["amount"]}
        defaultKeys={["sku", "amount"]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Mặc định" }));
    expect(onChange).toHaveBeenLastCalledWith(["sku", "amount"]);
  });
});
