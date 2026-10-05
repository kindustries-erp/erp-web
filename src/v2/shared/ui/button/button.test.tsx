import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Button } from "./button";

describe("V2 Button Primitive", () => {
  it("renders with default variant having bg-primary and text-primary-fg", () => {
    render(<Button>Bấm vào đây</Button>);
    const btn = screen.getByRole("button", { name: "Bấm vào đây" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass("bg-primary");
    expect(btn).toHaveClass("text-primary-fg");
  });

  it("handles click events properly", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Xác nhận</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("respects disabled state", () => {
    render(<Button disabled>Không khả dụng</Button>);
    const btn = screen.getByRole("button", { name: "Không khả dụng" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass("disabled:opacity-50");
  });

  it("applies outline and size variant classes correctly", () => {
    render(
      <Button variant="outline" size="sm">
        Nút nhỏ viền ngoài
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Nút nhỏ viền ngoài" });
    expect(btn).toHaveClass("border-input");
    expect(btn).toHaveClass("h-8");
  });

  it("renders primary and danger variants aliases correctly", () => {
    const { rerender } = render(<Button variant="primary">Lưu</Button>);
    expect(screen.getByRole("button", { name: "Lưu" })).toHaveClass(
      "bg-primary",
    );

    rerender(<Button variant="danger">Xóa</Button>);
    expect(screen.getByRole("button", { name: "Xóa" })).toHaveClass(
      "bg-destructive",
    );

    rerender(<Button variant="danger-outline">Hủy bỏ</Button>);
    expect(screen.getByRole("button", { name: "Hủy bỏ" })).toHaveClass(
      "border-destructive/50",
    );
  });

  it("renders size xs and icon-xs correctly", () => {
    const { rerender } = render(<Button size="xs">Nút siêu nhỏ</Button>);
    expect(screen.getByRole("button", { name: "Nút siêu nhỏ" })).toHaveClass(
      "h-6",
    );

    rerender(<Button size="icon-xs" aria-label="Icon nhỏ" />);
    expect(screen.getByRole("button", { name: "Icon nhỏ" })).toHaveClass("h-6");
    expect(screen.getByRole("button", { name: "Icon nhỏ" })).toHaveClass("w-6");
  });

  it("renders asChild correctly", () => {
    render(
      <Button asChild>
        <a href="/home">Trang chủ</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Trang chủ" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/home");
    expect(link).toHaveClass("bg-primary");
  });
});
