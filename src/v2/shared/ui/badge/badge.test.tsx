import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Badge } from "./badge";

describe("V2 Badge Primitive", () => {
  it("renders with default variant classes", () => {
    render(<Badge>Mặc định</Badge>);
    const badge = screen.getByText("Mặc định");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-primary");
    expect(badge).toHaveClass("text-primary-foreground");
  });

  it("renders secondary variant", () => {
    render(<Badge variant="secondary">Thứ cấp</Badge>);
    const badge = screen.getByText("Thứ cấp");
    expect(badge).toHaveClass("bg-secondary");
    expect(badge).toHaveClass("text-secondary-foreground");
  });

  it("renders success variant with emerald classes", () => {
    render(<Badge variant="success">Hoàn tất</Badge>);
    const badge = screen.getByText("Hoàn tất");
    expect(badge).toHaveClass("bg-emerald-500/15");
  });

  it("renders warning variant with amber classes", () => {
    render(<Badge variant="warning">Cảnh báo</Badge>);
    const badge = screen.getByText("Cảnh báo");
    expect(badge).toHaveClass("bg-amber-500/15");
  });

  it("applies custom className correctly", () => {
    render(<Badge className="custom-badge-class">Tùy biến</Badge>);
    const badge = screen.getByText("Tùy biến");
    expect(badge).toHaveClass("custom-badge-class");
  });
});
