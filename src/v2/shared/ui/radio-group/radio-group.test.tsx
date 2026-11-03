import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("V2 RadioGroup primitive", () => {
  it("marks the checked item and reports the clicked value", () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup value="a" onValueChange={onValueChange} aria-label="Chế độ">
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" />
      </RadioGroup>,
    );

    expect(screen.getByRole("radio", { name: "A" })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });
});
