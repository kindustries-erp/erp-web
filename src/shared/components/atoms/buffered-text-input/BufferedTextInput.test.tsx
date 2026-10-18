import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { BufferedTextInput } from "./BufferedTextInput";

describe("BufferedTextInput", () => {
  it("triggers onChange with string value on blur", () => {
    const onChange = vi.fn();
    render(<BufferedTextInput value="test" onChange={onChange} />);
    const input = screen.getByDisplayValue("test");
    fireEvent.change(input, { target: { value: "new-value" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith("new-value");
  });
});
