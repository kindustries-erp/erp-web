import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2ViewModeSectionHeader } from "./V2ViewModeCombobox.header";

describe("V2ViewModeSectionHeader", () => {
  it("hiện tiêu đề và nút hành động cùng một hàng căn phải", () => {
    render(
      <V2ViewModeSectionHeader
        title="Bộ lọc có sẵn"
        action={<button type="button">Tạo mới</button>}
      />,
    );

    const title = screen.getByText("Bộ lọc có sẵn");
    const action = screen.getByRole("button", { name: "Tạo mới" });

    expect(title.parentElement).toBe(action.parentElement);
    expect(title.parentElement?.className).toContain("justify-between");
  });

  it("tiêu đề dài bị cắt bằng truncate để không đẩy nút ra ngoài", () => {
    render(
      <V2ViewModeSectionHeader
        title="Một tiêu đề rất dài của nhóm bộ lọc"
        action={<button type="button">Tạo mới</button>}
      />,
    );

    expect(
      screen.getByText("Một tiêu đề rất dài của nhóm bộ lọc").className,
    ).toContain("truncate");
  });

  it("không có action thì chỉ hiện tiêu đề", () => {
    render(<V2ViewModeSectionHeader title="Chế độ xem" />);

    expect(screen.getByText("Chế độ xem")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
