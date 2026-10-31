import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2Badge } from "./V2Badge";
import { V2BadgeVariant } from "./V2Badge.type";

describe("V2Badge Atom", () => {
  it("renders children correctly with default variant", () => {
    render(<V2Badge>Test Badge</V2Badge>);
    const el = screen.getByText("Test Badge");
    expect(el).toBeInTheDocument();
  });

  it("renders with secondary variant enum", () => {
    render(<V2Badge variant={V2BadgeVariant.SECONDARY}>Secondary</V2Badge>);
    const el = screen.getByText("Secondary");
    expect(el).toBeInTheDocument();
    expect(el.className).toContain("bg-secondary");
  });

  it("renders with destructive variant enum", () => {
    render(<V2Badge variant={V2BadgeVariant.DESTRUCTIVE}>Alert</V2Badge>);
    const el = screen.getByText("Alert");
    expect(el).toBeInTheDocument();
    expect(el.className).toContain("bg-destructive");
  });

  it("applies custom className", () => {
    render(<V2Badge className="custom-class">Custom</V2Badge>);
    const el = screen.getByText("Custom");
    expect(el.className).toContain("custom-class");
  });
});
