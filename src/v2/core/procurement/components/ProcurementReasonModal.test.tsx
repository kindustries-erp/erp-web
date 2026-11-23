import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProcurementReasonModal } from "./ProcurementReasonModal";

describe("ProcurementReasonModal", () => {
  it("không gửi lý do rỗng và hiện thông báo bắt buộc nhập", () => {
    const onConfirm = vi.fn();
    render(
      <ProcurementReasonModal
        open
        title="Hủy GDMH-1"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /xác nhận|confirm/i }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText(/nhập lý do|reason/i)).toBeTruthy();
  });

  it("gửi lý do đã cắt khoảng trắng khi có nội dung", () => {
    const onConfirm = vi.fn();
    render(
      <ProcurementReasonModal
        open
        title="Hủy GDMH-1"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "  nhà cung cấp hết hàng " },
    });
    fireEvent.click(screen.getByRole("button", { name: /xác nhận|confirm/i }));
    expect(onConfirm).toHaveBeenCalledWith("nhà cung cấp hết hàng");
  });
});
