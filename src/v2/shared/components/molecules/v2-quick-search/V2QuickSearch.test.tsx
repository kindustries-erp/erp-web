import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { V2QuickSearch } from "./V2QuickSearch";

describe("V2QuickSearch Molecule", () => {
  it("renders search placeholder and shortcut label", () => {
    const handleClick = vi.fn();
    render(
      <V2QuickSearch
        onClick={handleClick}
        placeholder="Tìm đơn hàng, khách..."
        shortcutLabel="⌘K"
      />,
    );

    expect(screen.getByText("Tìm đơn hàng, khách...")).toBeInTheDocument();
    expect(screen.getByText("⌘K")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Tìm kiếm nhanh hệ thống" }),
    );
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
