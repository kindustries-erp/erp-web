import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErpCashVoucherCombobox } from "./ErpCashVoucherCombobox";

vi.mock("./ErpCashVoucherCombobox.hook", () => ({
  useErpCashVoucherCombobox: () => ({
    options: [
      {
        value: "cash-1",
        label: "[01/01/2026] PC-001 - Tiền mặt",
        code: "500.000đ",
        subLabel: "Chi nội bộ",
      },
    ],
    isLoading: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
    setSearch: vi.fn(),
  }),
}));

vi.mock("@/v2/shared/components/molecules/v2-combobox", () => ({
  V2Combobox: (props: any) => (
    <div
      data-testid="mock-v2-combobox"
      data-value={props.value}
      data-options-count={props.options?.length || 0}
      data-placeholder={props.placeholder}
    >
      <span>{props.fallbackLabel || props.placeholder}</span>
    </div>
  ),
}));

describe("ErpCashVoucherCombobox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders V2Combobox with mapped options and description", () => {
    render(
      <ErpCashVoucherCombobox
        value="cash-1"
        placeholder="Chọn phiếu thu chi ERP..."
      />,
    );

    const combobox = screen.getByTestId("mock-v2-combobox");
    expect(combobox).toBeInTheDocument();
    expect(combobox.getAttribute("data-value")).toBe("cash-1");
    expect(combobox.getAttribute("data-options-count")).toBe("1");
  });
});
