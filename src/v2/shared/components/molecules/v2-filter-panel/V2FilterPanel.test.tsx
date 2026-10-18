import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { V2FilterPanel } from "./V2FilterPanel";

const make = (
  over: Partial<React.ComponentProps<typeof V2FilterPanel>> = {},
) => {
  const props = {
    activeCount: 0,
    onResetAll: vi.fn(),
    onClose: vi.fn(),
    search: "",
    onSearchChange: vi.fn(),
    columnCount: 2,
    ...over,
  };
  render(
    <V2FilterPanel {...props}>
      <div>card A</div>
    </V2FilterPanel>,
  );
  return props;
};

describe("V2FilterPanel", () => {
  it("hiện tiêu đề, số cột, nội dung và nút đóng", () => {
    const p = make();
    expect(
      screen.getByRole("complementary", { name: "Bộ lọc" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Bộ lọc theo cột (2)")).toBeInTheDocument();
    expect(screen.getByText("card A")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Đóng bộ lọc" }));
    expect(p.onClose).toHaveBeenCalled();
  });

  it("nút xóa tất cả và (N) chỉ hiện khi đang lọc", () => {
    expect(
      screen.queryByRole("button", { name: "Xóa tất cả bộ lọc" }),
    ).toBeNull();
    const p = make({ activeCount: 2 });
    expect(screen.getByText("(2)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Xóa tất cả bộ lọc" }));
    expect(p.onResetAll).toHaveBeenCalled();
  });

  it("ô tìm cột gọi onSearchChange và có nút xóa khi có chữ", () => {
    const p = make({ search: "ngày" });
    fireEvent.change(screen.getByLabelText("Tìm cột cần lọc..."), {
      target: { value: "số" },
    });
    expect(p.onSearchChange).toHaveBeenCalledWith("số");
    fireEvent.click(screen.getByRole("button", { name: "Xóa tìm kiếm" }));
    expect(p.onSearchChange).toHaveBeenCalledWith("");
  });

  it("không có cột phù hợp thì báo trống thay vì render children", () => {
    make({ columnCount: 0 });
    expect(screen.getByText("Không có cột phù hợp")).toBeInTheDocument();
    expect(screen.queryByText("card A")).toBeNull();
  });
});
