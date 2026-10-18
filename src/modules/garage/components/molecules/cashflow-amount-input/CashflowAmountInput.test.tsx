import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CashflowAmountInput } from "./CashflowAmountInput";

describe("CashflowAmountInput Molecule", () => {
  it("renders with empty display when value is 0", () => {
    render(<CashflowAmountInput value={0} onChange={vi.fn()} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("");
    expect(screen.queryByText(/Bằng chữ:/)).not.toBeInTheDocument();
  });

  it("formats value with thousand separators and displays words in Vietnamese", () => {
    render(<CashflowAmountInput value={5000000} onChange={vi.fn()} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("5.000.000");
    expect(screen.getByText(/Bằng chữ:/)).toBeInTheDocument();
    expect(screen.getByText(/Năm triệu đồng/)).toBeInTheDocument();
    expect(screen.queryByText(/Định dạng số:/)).not.toBeInTheDocument();
  });

  it("calls onChange with parsed numeric value when user types digits", () => {
    const handleChange = vi.fn();
    render(<CashflowAmountInput value={0} onChange={handleChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "1250000" } });
    expect(handleChange).toHaveBeenCalledWith(1250000);
  });

  it("strips non-numeric characters when user types", () => {
    const handleChange = vi.fn();
    render(<CashflowAmountInput value={0} onChange={handleChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "abc 12.345 đ" } });
    expect(handleChange).toHaveBeenCalledWith(12345);
  });
});
