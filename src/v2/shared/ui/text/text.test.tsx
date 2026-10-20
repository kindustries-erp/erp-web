import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Text } from "./text";

describe("V2 Text Primitive", () => {
  it("renders with default variant as <p> tag", () => {
    render(<Text>Đoạn văn bản mặc định</Text>);
    const el = screen.getByText("Đoạn văn bản mặc định");
    expect(el.tagName.toLowerCase()).toBe("p");
    expect(el).toHaveClass("text-sm");
  });

  it("renders as <h1> when variant='h1'", () => {
    render(<Text variant="h1">Tiêu đề lớn</Text>);
    const el = screen.getByRole("heading", { level: 1 });
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("text-2xl");
  });

  it("allows custom 'as' prop to override default tag", () => {
    render(
      <Text variant="h1" as="span">
        Tiêu đề dạng span
      </Text>,
    );
    const el = screen.getByText("Tiêu đề dạng span");
    expect(el.tagName.toLowerCase()).toBe("span");
    expect(el).toHaveClass("text-2xl");
  });

  it("applies color and weight classes correctly", () => {
    render(
      <Text color="muted" weight="bold">
        Chữ mờ in đậm
      </Text>,
    );
    const el = screen.getByText("Chữ mờ in đậm");
    expect(el).toHaveClass("text-muted-fg");
    expect(el).toHaveClass("font-bold");
  });

  it("renders code variant as <code> tag with monospace styles", () => {
    render(<Text variant="code">const x = 1;</Text>);
    const el = screen.getByText("const x = 1;");
    expect(el.tagName.toLowerCase()).toBe("code");
    expect(el).toHaveClass("font-mono");
  });

  it("renders asChild correctly", () => {
    render(
      <Text asChild variant="link">
        <a href="/login">Đăng nhập</a>
      </Text>,
    );
    const link = screen.getByRole("link", { name: "Đăng nhập" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
    expect(link).toHaveClass("text-primary");
  });
});
