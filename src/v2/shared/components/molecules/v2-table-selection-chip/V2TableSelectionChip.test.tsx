import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { V2TableSelectionChip } from "./V2TableSelectionChip";

describe("V2TableSelectionChip", () => {
  it("ẩn khi chưa chọn hàng nào", () => {
    const { container } = render(
      <V2TableSelectionChip count={0} onClear={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("hiện (N) và nút ✕ gọi onClear", () => {
    const onClear = vi.fn();
    render(<V2TableSelectionChip count={2} onClear={onClear} />);
    expect(screen.getByText("(2)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Bỏ chọn (2)" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("bọc trigger bằng renderMenu", () => {
    render(
      <V2TableSelectionChip
        count={3}
        onClear={vi.fn()}
        renderMenu={(trigger) => <div data-testid="menu">{trigger}</div>}
      />,
    );
    expect(screen.getByTestId("menu")).toHaveTextContent("(3)");
  });
});
