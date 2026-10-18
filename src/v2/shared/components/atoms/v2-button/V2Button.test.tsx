import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Plus, ArrowRight } from "lucide-react";
import { V2Button } from "./V2Button";

describe("V2Button Atom", () => {
  it("renders with default props and handles click", () => {
    const handleClick = vi.fn();
    render(<V2Button onClick={handleClick}>Lưu dữ liệu</V2Button>);
    const btn = screen.getByRole("button", { name: "Lưu dữ liệu" });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("handles disabled state correctly", () => {
    const handleClick = vi.fn();
    render(
      <V2Button disabled onClick={handleClick}>
        Không thể bấm
      </V2Button>,
    );
    const btn = screen.getByRole("button", { name: "Không thể bấm" });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("handles isLoading state with spinner and loadingText", () => {
    const handleClick = vi.fn();
    const { rerender } = render(
      <V2Button isLoading onClick={handleClick}>
        Gửi yêu cầu
      </V2Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toHaveClass("cursor-wait");
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();

    // With loadingText
    rerender(
      <V2Button isLoading loadingText="Đang xử lý..." onClick={handleClick}>
        Gửi yêu cầu
      </V2Button>,
    );
    expect(screen.getByText("Đang xử lý...")).toBeInTheDocument();
    expect(screen.queryByText("Gửi yêu cầu")).not.toBeInTheDocument();
  });

  it("renders leftIcon and rightIcon properly", () => {
    render(
      <V2Button
        leftIcon={<Plus data-testid="left-icon" size={14} />}
        rightIcon={<ArrowRight data-testid="right-icon" size={14} />}
      >
        Thêm mới
      </V2Button>,
    );
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
    expect(screen.getByText("Thêm mới")).toBeInTheDocument();
  });

  it("applies fullWidth class when specified", () => {
    render(<V2Button fullWidth>Toàn chiều ngang</V2Button>);
    const btn = screen.getByRole("button", { name: "Toàn chiều ngang" });
    expect(btn).toHaveClass("w-full");
  });

  it("renders asChild anchor correctly", () => {
    render(
      <V2Button asChild variant="outline">
        <a href="/dashboard">Bảng điều khiển</a>
      </V2Button>,
    );
    const link = screen.getByRole("link", { name: "Bảng điều khiển" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/dashboard");
    expect(link).toHaveClass("border-input");
  });
});
