import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { V2FormField } from "./V2FormField";
import { V2FormFieldType } from "./V2FormField.type";

describe("V2FormField - Editing & Layout", () => {
  it("renders DrawerField label và required asterisk trong edit mode", () => {
    render(
      <V2FormField label="Tên đối tác" value="" required onChange={vi.fn()} />,
    );

    expect(screen.getByText("Tên đối tác")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders thông báo lỗi khi có prop error", () => {
    render(
      <V2FormField
        label="Mã"
        value=""
        error="Mã là bắt buộc"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Mã là bắt buộc")).toBeInTheDocument();
  });

  it("cho phép nhập text và tự động uppercase nếu cấu hình", () => {
    const onChange = vi.fn();
    render(<V2FormField label="Mã" value="" uppercase onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "hilo-01" } });
    expect(onChange).toHaveBeenCalledWith("HILO-01");
  });

  it("renders các slot prefix, suffix và action", () => {
    render(
      <V2FormField
        label="Mã"
        value="AUTO-01"
        prefixSlot={<span data-testid="prefix">PRE</span>}
        suffixSlot={<span data-testid="suffix">SUF</span>}
        actionSlot={<button data-testid="action-btn">Gen</button>}
      />,
    );

    expect(screen.getByTestId("prefix")).toBeInTheDocument();
    expect(screen.getByTestId("suffix")).toBeInTheDocument();
    expect(screen.getByTestId("action-btn")).toBeInTheDocument();
  });

  it("noWrapper không bọc DrawerField", () => {
    render(<V2FormField label="Không hiện label" value="Direct" noWrapper />);

    expect(screen.queryByText("Không hiện label")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("hỗ trợ custom render khi type là CUSTOM", () => {
    render(
      <V2FormField
        type={V2FormFieldType.CUSTOM}
        value="CustomVal"
        render={(p) => <div data-testid="custom-val">{p.value}</div>}
      />,
    );

    expect(screen.getByTestId("custom-val")).toHaveTextContent("CustomVal");
  });
});
