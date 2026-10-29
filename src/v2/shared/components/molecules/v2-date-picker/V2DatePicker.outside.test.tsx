import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2DatePicker } from "./V2DatePicker";

const pointerDown = (el: Element) => {
  fireEvent.pointerDown(el, { pointerType: "mouse", button: 0 });
};

describe("V2DatePicker outside click", () => {
  it("closes when clicking outside the picker", async () => {
    render(
      <div>
        <span>outside</span>
        <V2DatePicker
          value={null}
          onValueChange={vi.fn()}
          placeholder="dd/mm/yyyy"
        />
      </div>,
    );
    const trigger = screen.getByRole("button", { name: "dd/mm/yyyy" });

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await new Promise((r) => setTimeout(r, 50));

    pointerDown(screen.getByText("outside"));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("stays open when clicking inside the calendar panel", async () => {
    render(
      <V2DatePicker
        value={null}
        onValueChange={vi.fn()}
        placeholder="dd/mm/yyyy"
      />,
    );
    const trigger = screen.getByRole("button", { name: "dd/mm/yyyy" });

    fireEvent.click(trigger);
    await new Promise((r) => setTimeout(r, 50));

    const panel = document.querySelector("[data-v2-date-panel]");
    expect(panel).not.toBeNull();
    pointerDown(panel as Element);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
