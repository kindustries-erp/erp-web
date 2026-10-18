import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { V2ReadValue, V2TextField } from "./V2FormControls";

describe("V2ReadValue", () => {
  it("shows a dash when the value is empty", () => {
    render(<V2ReadValue value="" />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("offers a copy button only when requested and a value exists", () => {
    const { unmount } = render(<V2ReadValue value="KH-001" copy />);
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    unmount();

    render(<V2ReadValue value="KH-001" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("V2TextField", () => {
  it("renders read-only text in view mode", () => {
    render(<V2TextField viewing value="Quận 1" onChange={vi.fn()} />);
    expect(screen.getByText("Quận 1")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("emits the new string from the input in edit mode", () => {
    const onChange = vi.fn();
    render(<V2TextField viewing={false} value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Hà Nội" },
    });
    expect(onChange).toHaveBeenCalledWith("Hà Nội");
  });
});
