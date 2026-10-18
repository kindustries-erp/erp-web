import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2PageButton } from "./V2PageButton";

describe("V2PageButton", () => {
  it("renders its label and handles clicks", () => {
    const onClick = vi.fn();
    render(<V2PageButton onClick={onClick}>3</V2PageButton>);
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("marks the active page with aria-current and primary colors", () => {
    render(<V2PageButton active>5</V2PageButton>);
    const button = screen.getByRole("button", { name: "5" });
    expect(button).toHaveAttribute("aria-current", "page");
    expect(button).toHaveClass("bg-primary", "text-primary-fg");
  });

  it("is a plain bordered square when inactive", () => {
    render(<V2PageButton>2</V2PageButton>);
    const button = screen.getByRole("button", { name: "2" });
    expect(button).not.toHaveAttribute("aria-current");
    expect(button).toHaveClass("h-7", "w-7", "border-border");
  });

  it("does not fire when disabled", () => {
    const onClick = vi.fn();
    render(
      <V2PageButton disabled onClick={onClick}>
        ›
      </V2PageButton>,
    );
    fireEvent.click(screen.getByRole("button", { name: "›" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
