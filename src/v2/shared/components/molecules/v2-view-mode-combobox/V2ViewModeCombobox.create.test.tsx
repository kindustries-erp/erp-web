import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2ViewModeCreateButton } from "./V2ViewModeCombobox.create";

describe("V2ViewModeCreateButton", () => {
  it("hiển thị nhãn và gọi onClick khi bấm", () => {
    const onClick = vi.fn();
    render(<V2ViewModeCreateButton label="Tạo bộ lọc mới" onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Tạo bộ lọc mới" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("khi disabled thì không gọi onClick", () => {
    const onClick = vi.fn();
    render(
      <V2ViewModeCreateButton
        label="Tạo bộ lọc mới"
        onClick={onClick}
        disabled
      />,
    );

    const button = screen.getByRole("button", { name: "Tạo bộ lọc mới" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("hiển thị nhãn ngắn Tạo mới, tên truy cập là nhãn đầy đủ", () => {
    render(
      <V2ViewModeCreateButton label="Tạo chế độ xem mới" onClick={vi.fn()} />,
    );

    const button = screen.getByRole("button", { name: "Tạo chế độ xem mới" });
    expect(button).toHaveTextContent("Tạo mới");
    expect(button).toHaveAttribute("title", "Tạo chế độ xem mới");
  });
});
