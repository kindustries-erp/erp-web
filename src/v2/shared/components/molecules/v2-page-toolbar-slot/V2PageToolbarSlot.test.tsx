import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { V2PageToolbarSlot } from "./V2PageToolbarSlot";

describe("V2PageToolbarSlot", () => {
  it("registers its element under the tab key", () => {
    const register = vi.fn();
    const { container } = render(
      <V2PageToolbarSlot tabKey="in" active register={register} />,
    );

    const slot = container.querySelector('[data-toolbar-slot="in"]');
    expect(slot).not.toBeNull();
    expect(register).toHaveBeenLastCalledWith("in", slot);
  });

  it("is visible only when active", () => {
    const { container, rerender } = render(
      <V2PageToolbarSlot tabKey="in" active register={() => {}} />,
    );
    const slot = container.querySelector('[data-toolbar-slot="in"]');
    expect(slot).toHaveClass("flex");
    expect(slot).not.toHaveClass("hidden");

    rerender(
      <V2PageToolbarSlot tabKey="in" active={false} register={() => {}} />,
    );
    expect(container.querySelector('[data-toolbar-slot="in"]')).toHaveClass(
      "hidden",
    );
  });
});
