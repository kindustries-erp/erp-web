import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { V2SearchInput } from "./V2SearchInput";

const box = () => screen.getByRole("textbox");

describe("V2SearchInput", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("debounces onChange while typing", () => {
    const onChange = vi.fn();
    render(<V2SearchInput onChange={onChange} debounceMs={300} />);
    fireEvent.change(box(), { target: { value: "hd" } });
    expect(onChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("hd");
  });

  it("commits immediately on Enter", () => {
    const onChange = vi.fn();
    render(<V2SearchInput onChange={onChange} />);
    fireEvent.change(box(), { target: { value: "abc" } });
    fireEvent.keyDown(box(), { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("abc");
  });

  it("clears with the clear button and calls onChange with empty text", () => {
    const onChange = vi.fn();
    render(<V2SearchInput value="abc" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Xóa tìm kiếm" }));
    expect(onChange).toHaveBeenCalledWith("");
    expect(box()).toHaveValue("");
  });

  it("follows an external value change without calling onChange", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <V2SearchInput value="abc" onChange={onChange} />,
    );
    rerender(<V2SearchInput value="" onChange={onChange} />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(box()).toHaveValue("");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("hides the clear button when empty", () => {
    render(<V2SearchInput onChange={vi.fn()} />);
    expect(
      screen.queryByRole("button", { name: "Xóa tìm kiếm" }),
    ).not.toBeInTheDocument();
  });
});
