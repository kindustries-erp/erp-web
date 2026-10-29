import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2Combobox } from "./V2Combobox";

const options = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
];

const pointerDown = (el: Element) => {
  fireEvent.pointerDown(el, { pointerType: "mouse", button: 0 });
};

describe("V2Combobox outside click and exclusivity", () => {
  it("đóng khi click ra ngoài", async () => {
    render(
      <div>
        <span>outside</span>
        <V2Combobox
          options={options}
          value={null}
          onValueChange={vi.fn()}
          placeholder="Chọn A"
          searchable={false}
        />
      </div>,
    );
    const trigger = screen.getByRole("combobox", { name: "Chọn A" });

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await new Promise((r) => setTimeout(r, 50));

    pointerDown(screen.getByText("outside"));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("không đóng khi click vào danh sách", async () => {
    render(
      <V2Combobox
        options={options}
        value={null}
        onValueChange={vi.fn()}
        placeholder="Chọn A"
        searchable={false}
      />,
    );
    const trigger = screen.getByRole("combobox", { name: "Chọn A" });

    fireEvent.click(trigger);
    await new Promise((r) => setTimeout(r, 50));

    const panel = document.querySelector("[data-v2-combobox-panel]");
    expect(panel).not.toBeNull();
    pointerDown(panel as Element);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("mở combobox B thì combobox A đóng", async () => {
    render(
      <div>
        <V2Combobox
          options={options}
          value={null}
          onValueChange={vi.fn()}
          placeholder="Kỳ A"
          searchable={false}
        />
        <V2Combobox
          options={options}
          value={null}
          onValueChange={vi.fn()}
          placeholder="Tài khoản B"
          searchable={false}
        />
      </div>,
    );
    const triggerA = screen.getByRole("combobox", { name: "Kỳ A" });
    const triggerB = screen.getByRole("combobox", { name: "Tài khoản B" });

    fireEvent.click(triggerA);
    await new Promise((r) => setTimeout(r, 50));
    expect(triggerA).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(triggerB);
    await new Promise((r) => setTimeout(r, 50));
    expect(triggerB).toHaveAttribute("aria-expanded", "true");
    expect(triggerA).toHaveAttribute("aria-expanded", "false");
  });
});
