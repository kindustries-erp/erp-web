import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2AuthBrandBadge } from "./V2AuthBrandBadge";

describe("V2AuthBrandBadge", () => {
  it("renders with default size md", () => {
    render(<V2AuthBrandBadge />);
    const badge = screen.getByTestId("v2-auth-brand-badge");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("w-12 h-12");
  });

  it("applies small size class when size=sm", () => {
    render(<V2AuthBrandBadge size="sm" />);
    const badge = screen.getByTestId("v2-auth-brand-badge");
    expect(badge.className).toContain("w-10 h-10");
  });

  it("applies large size class when size=lg", () => {
    render(<V2AuthBrandBadge size="lg" />);
    const badge = screen.getByTestId("v2-auth-brand-badge");
    expect(badge.className).toContain("w-16 h-16");
  });
});
