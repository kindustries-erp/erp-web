import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { V2Combobox } from "./V2Combobox";

const options = [
  { value: "a", label: "HĐ 1" },
  { value: "b", label: "HĐ 2" },
];

describe("V2Combobox onSearchChange", () => {
  it("reports each typed query so the caller can search on the server", () => {
    const onSearchChange = vi.fn();
    render(
      <V2Combobox
        options={options}
        value={null}
        onValueChange={vi.fn()}
        onSearchChange={onSearchChange}
        searchPlaceholder="Tìm số HĐ"
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.change(screen.getByPlaceholderText("Tìm số HĐ"), {
      target: { value: "1847" },
    });

    expect(onSearchChange).toHaveBeenLastCalledWith("1847");
  });

  it("works without onSearchChange (backward compatible)", () => {
    render(
      <V2Combobox options={options} value={null} onValueChange={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("shows a busy state instead of the empty message while loading", () => {
    render(
      <V2Combobox options={[]} value={null} onValueChange={vi.fn()} loading />,
    );
    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Đang tìm...")).toBeInTheDocument();
    expect(screen.queryByText("Không có kết quả")).toBeNull();
  });
});
