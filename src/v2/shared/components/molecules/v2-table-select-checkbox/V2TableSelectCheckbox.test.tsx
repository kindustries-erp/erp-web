import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2TableSelectCheckbox } from "./V2TableSelectCheckbox";

describe("V2TableSelectCheckbox", () => {
  it("reports a boolean value when toggled", () => {
    const onCheckedChange = vi.fn();
    render(
      <V2TableSelectCheckbox
        aria-label="Chọn dòng"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Chọn dòng" }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("accepts the indeterminate state for partial page selection", () => {
    render(
      <V2TableSelectCheckbox
        aria-label="Chọn tất cả"
        checked="indeterminate"
        onCheckedChange={() => {}}
      />,
    );

    expect(
      screen.getByRole("checkbox", { name: "Chọn tất cả" }),
    ).toHaveAttribute("data-state", "indeterminate");
  });
});
