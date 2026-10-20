import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { V2FilterChip } from "./V2FilterChip";

describe("V2FilterChip", () => {
  it("hiện tên cột kèm tóm tắt và gọi onClick", () => {
    const onClick = vi.fn();
    render(
      <V2FilterChip
        label="Bên bán"
        summary="3 giá trị"
        onRemove={vi.fn()}
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Bên bán: 3 giá trị" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("nút ✕ gỡ chip và có aria-label theo cột", () => {
    const onRemove = vi.fn();
    render(<V2FilterChip label="Ngày HĐ" onRemove={onRemove} />);
    fireEvent.click(screen.getByRole("button", { name: "Gỡ bộ lọc: Ngày HĐ" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
