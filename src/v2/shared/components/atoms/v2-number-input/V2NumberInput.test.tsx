import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2NumberInput } from "./V2NumberInput";

const box = () => screen.getByRole("textbox");

describe("V2NumberInput", () => {
  it("shows a formatted value when not focused", () => {
    render(<V2NumberInput value={1234567} onValueChange={vi.fn()} />);
    expect(box()).toHaveValue("1.234.567");
  });

  it("shows an editable value while focused", () => {
    render(
      <V2NumberInput value={1250.5} decimals={2} onValueChange={vi.fn()} />,
    );
    fireEvent.focus(box());
    expect(box()).toHaveValue("1250,5");
  });

  it("reports parsed numbers while typing", () => {
    const onValueChange = vi.fn();
    render(
      <V2NumberInput value={null} decimals={2} onValueChange={onValueChange} />,
    );
    fireEvent.focus(box());
    fireEvent.change(box(), { target: { value: "12,5" } });
    expect(onValueChange).toHaveBeenLastCalledWith(12.5);
    fireEvent.change(box(), { target: { value: "" } });
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("clamps to max on blur", () => {
    const onValueChange = vi.fn();
    render(
      <V2NumberInput value={null} max={100} onValueChange={onValueChange} />,
    );
    fireEvent.focus(box());
    fireEvent.change(box(), { target: { value: "250" } });
    fireEvent.blur(box());
    expect(onValueChange).toHaveBeenLastCalledWith(100);
  });

  it("uses a decimal keyboard only when decimals are allowed", () => {
    const { rerender } = render(
      <V2NumberInput value={null} onValueChange={vi.fn()} />,
    );
    expect(box()).toHaveAttribute("inputmode", "numeric");
    rerender(
      <V2NumberInput value={null} decimals={2} onValueChange={vi.fn()} />,
    );
    expect(box()).toHaveAttribute("inputmode", "decimal");
  });
});
