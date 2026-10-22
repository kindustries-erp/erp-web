import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { V2ThemeToggle } from "./V2ThemeToggle";

describe("V2ThemeToggle Molecule Component", () => {
  it("renders correctly in light mode", () => {
    render(<V2ThemeToggle isDark={false} />);
    const button = screen.getByTestId("v2-theme-toggle");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-theme-state", "light");
    expect(button).toHaveAttribute("aria-label", "Chuyển sang giao diện tối");
  });

  it("renders correctly in dark mode", () => {
    render(<V2ThemeToggle isDark={true} />);
    const button = screen.getByTestId("v2-theme-toggle");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-theme-state", "dark");
    expect(button).toHaveAttribute("aria-label", "Chuyển sang giao diện sáng");
  });

  it("calls onToggle when clicked", () => {
    const handleToggle = vi.fn();
    render(<V2ThemeToggle isDark={false} onToggle={handleToggle} />);
    const button = screen.getByTestId("v2-theme-toggle");
    fireEvent.click(button);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});
