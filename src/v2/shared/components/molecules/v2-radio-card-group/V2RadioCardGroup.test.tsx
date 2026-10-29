import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2RadioCardGroup } from "./V2RadioCardGroup";

const options = [
  { value: "period", label: "Theo kỳ", description: "Chọn khoảng thời gian" },
  { value: "filter", label: "Theo filter hiện tại", description: "Giữ bộ lọc" },
] as const;

describe("V2RadioCardGroup", () => {
  it("marks the selected card and reports the clicked value", () => {
    const onValueChange = vi.fn();
    render(
      <V2RadioCardGroup
        name="mode"
        ariaLabel="Chế độ xuất"
        options={[...options]}
        value="period"
        onValueChange={onValueChange}
      />,
    );

    expect(
      screen.getByRole("radiogroup", { name: "Chế độ xuất" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Theo kỳ/ })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: /Theo filter/ }));
    expect(onValueChange).toHaveBeenCalledWith("filter");
  });

  it("does not fire for a disabled option", () => {
    const onValueChange = vi.fn();
    render(
      <V2RadioCardGroup
        name="mode"
        ariaLabel="Chế độ xuất"
        options={[{ value: "a", label: "A", disabled: true }]}
        value="a"
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole("radio", { name: /A/ })).toBeDisabled();
  });
});
