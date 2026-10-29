import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { V2TableFilterChip } from "./V2TableFilterChip";

describe("V2TableFilterChip", () => {
  it("ẩn khi không có bộ lọc nào active (count <= 0)", () => {
    const { container } = render(
      <V2TableFilterChip count={0} onClear={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("hiển thị số lượng bộ lọc (mặc định không có text inline Bộ lọc) và nút ✕ gọi onClear", () => {
    const onClear = vi.fn();
    render(<V2TableFilterChip count={2} onClear={onClear} />);

    expect(screen.getByText("(2)")).toBeInTheDocument();
    expect(screen.queryByText("Bộ lọc")).not.toBeInTheDocument();

    const clearBtn = screen.getByRole("button", { name: "Xóa bộ lọc (2)" });
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("bấm vào phần thông tin bên trái gọi onToggleFilter", () => {
    const onToggle = vi.fn();
    render(
      <V2TableFilterChip
        count={3}
        onClear={vi.fn()}
        onToggleFilter={onToggle}
      />,
    );

    const toggleBtn = screen.getByRole("button", { name: "Bộ lọc (3)" });
    fireEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("hiện nhãn chữ khi showLabel = true", () => {
    render(<V2TableFilterChip count={1} showLabel={true} onClear={vi.fn()} />);

    expect(screen.getByText("Bộ lọc")).toBeInTheDocument();
    expect(screen.getByText("(1)")).toBeInTheDocument();
  });
});
