import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErpBankTransactionCombobox } from "./ErpBankTransactionCombobox";

vi.mock("./ErpBankTransactionCombobox.hook", () => ({
  useErpBankTransactionCombobox: () => ({
    options: [
      {
        value: "bank-1",
        label: "[01/01/2026] REF-001 - VCB",
        code: "1.000.000đ",
        subLabel: "Thu tiền garage",
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

describe("ErpBankTransactionCombobox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders V2Combobox with mapped options and description", () => {
    render(
      <ErpBankTransactionCombobox
        value="bank-1"
        placeholder="Chọn giao dịch ngân hàng..."
      />,
    );

    const combobox = screen.getByTestId("mock-v2-combobox");
    expect(combobox).toBeInTheDocument();
    expect(combobox.getAttribute("data-value")).toBe("bank-1");
    expect(combobox.getAttribute("data-options-count")).toBe("1");
  });
});
