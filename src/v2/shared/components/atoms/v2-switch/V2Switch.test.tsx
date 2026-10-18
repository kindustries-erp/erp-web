import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2Switch } from "./V2Switch";

describe("V2Switch", () => {
  it("toggles itself when uncontrolled", () => {
    const onCheckedChange = vi.fn();
    render(<V2Switch label="Nháp" onCheckedChange={onCheckedChange} />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("follows the checked prop when controlled", () => {
    const onCheckedChange = vi.fn();
    render(
      <V2Switch
        checked={false}
        onCheckedChange={onCheckedChange}
        aria-label="Bật"
      />,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("starts on with defaultChecked", () => {
    render(<V2Switch defaultChecked aria-label="Bật" />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("does not toggle when disabled", () => {
    const onCheckedChange = vi.fn();
    render(
      <V2Switch disabled onCheckedChange={onCheckedChange} aria-label="Bật" />,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("is labelled by its text", () => {
    render(<V2Switch label="Nháp" />);
    expect(screen.getByText("Nháp")).toBeInTheDocument();
  });
});
