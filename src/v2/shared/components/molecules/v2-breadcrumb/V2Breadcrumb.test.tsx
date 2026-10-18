import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { V2Breadcrumb } from "./V2Breadcrumb";

describe("V2Breadcrumb Molecule", () => {
  it("renders breadcrumb items and current page indicator", () => {
    const handleClick = vi.fn();
    const items = [
      { label: "Trang chủ", onClick: handleClick },
      { label: "Bán hàng" },
      { label: "Đơn bán hàng" },
    ];

    render(<V2Breadcrumb items={items} />);

    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
    expect(screen.getByText("Bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Đơn bán hàng")).toBeInTheDocument();

    const homeBtn = screen.getByRole("button", { name: "Trang chủ" });
    fireEvent.click(homeBtn);
    expect(handleClick).toHaveBeenCalledTimes(1);

    const currentPage = screen.getByText("Đơn bán hàng");
    expect(currentPage).toHaveAttribute("aria-current", "page");
  });

  it("returns null when items is empty", () => {
    const { container } = render(<V2Breadcrumb items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
