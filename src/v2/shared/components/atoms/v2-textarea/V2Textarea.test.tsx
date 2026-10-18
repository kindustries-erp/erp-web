import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2Textarea } from "./V2Textarea";

describe("V2Textarea", () => {
  it("renders a textarea with the given value and rows", () => {
    render(<V2Textarea defaultValue="Ghi chú" rows={5} aria-label="Ghi chú" />);
    const box = screen.getByRole("textbox", { name: "Ghi chú" });
    expect(box).toHaveValue("Ghi chú");
    expect(box).toHaveAttribute("rows", "5");
  });

  it("calls onChange when typing", () => {
    const onChange = vi.fn();
    render(<V2Textarea aria-label="Ghi chú" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "a" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<V2Textarea aria-label="Ghi chú" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
