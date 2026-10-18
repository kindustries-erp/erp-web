import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { V2SidebarToggleBtn } from "./V2SidebarToggleBtn";

describe("V2SidebarToggleBtn Atom", () => {
  it("render đúng kích thước w-[26px] h-[26px] và gọi onClick", () => {
    const handleClick = vi.fn();
    render(<V2SidebarToggleBtn onClick={handleClick} />);
    const btn = screen.getByTestId("v2-sidebar-toggle-btn");
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("xoay 180 độ khi isCollapsed=true", () => {
    render(<V2SidebarToggleBtn isCollapsed={true} />);
    const iconSpan = screen.getByTestId("v2-sidebar-toggle-btn").firstChild;
    expect(iconSpan).toHaveClass("rotate-180");
  });
});
