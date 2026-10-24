import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Search } from "lucide-react";
import { V2Input } from "./V2Input";

describe("V2Input", () => {
  it("renders input with placeholder and value", () => {
    render(<V2Input placeholder="Nhập tên..." defaultValue="Antigravity" />);
    const input = screen.getByPlaceholderText("Nhập tên...");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Antigravity");
  });

  it("handles onChange when user types", () => {
    const handleChange = vi.fn();
    render(<V2Input placeholder="Nhập..." onChange={handleChange} />);
    const input = screen.getByPlaceholderText("Nhập...");
    fireEvent.change(input, { target: { value: "Hello" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("Hello");
  });

  it("renders with leftIcon and rightIcon", () => {
    render(
      <V2Input
        placeholder="Tìm kiếm"
        leftIcon={<Search data-testid="search-icon" />}
        rightIcon={<span data-testid="right-tag">VND</span>}
      />,
    );
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    expect(screen.getByTestId("right-tag")).toBeInTheDocument();
  });

  it("clears content when clear button is clicked", () => {
    const handleClear = vi.fn();
    render(
      <V2Input
        placeholder="Tìm kiếm"
        defaultValue="Từ khóa"
        clearable
        onClear={handleClear}
      />,
    );
    const clearBtn = screen.getByRole("button", { name: "Xóa" });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
    expect(screen.getByPlaceholderText("Tìm kiếm")).toHaveValue("");
  });

  it("forwards ref properly", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<V2Input ref={ref} placeholder="Ref test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
