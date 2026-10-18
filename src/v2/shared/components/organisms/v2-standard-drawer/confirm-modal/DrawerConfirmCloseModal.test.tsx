import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DrawerConfirmCloseModal } from "./DrawerConfirmCloseModal";

describe("DrawerConfirmCloseModal", () => {
  it("shows the unsaved-changes message when open", () => {
    render(
      <DrawerConfirmCloseModal open onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByText("Xác nhận đóng biểu mẫu")).toBeInTheDocument();
    expect(
      screen.getByText(/Bạn có chắc chắn muốn đóng và hủy/),
    ).toBeInTheDocument();
  });

  it("calls onConfirm when the discard button is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <DrawerConfirmCloseModal open onConfirm={onConfirm} onCancel={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Đóng không lưu" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when the continue button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <DrawerConfirmCloseModal open onConfirm={vi.fn()} onCancel={onCancel} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục chỉnh sửa" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when closed", () => {
    render(
      <DrawerConfirmCloseModal
        open={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(
      screen.queryByText("Xác nhận đóng biểu mẫu"),
    ).not.toBeInTheDocument();
  });
});
