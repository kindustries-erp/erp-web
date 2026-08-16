import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmModal } from "../ConfirmModal";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => {
    const map: Record<string, string> = {
      "confirmModal.defaultTitle": "Xác nhận hành động",
      "confirmModal.defaultCancel": "Hủy bỏ",
      "confirmModal.defaultConfirm": "Xác nhận",
      "common.processing": "Đang xử lý...",
    };
    return map[key] ?? key;
  },
}));

describe("ConfirmModal", () => {
  it("renders properly when open is true", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmModal
        open={true}
        title="Đóng bảng chỉnh sửa?"
        message="Dữ liệu chưa lưu sẽ bị mất."
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText("Đóng bảng chỉnh sửa?")).toBeInTheDocument();
    expect(screen.getByText("Dữ liệu chưa lưu sẽ bị mất.")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmModal
        open={true}
        title="Xác nhận"
        message="Nội dung"
        confirmLabel="Đồng ý"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByText("Đồng ý"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmModal
        open={true}
        title="Xác nhận"
        message="Nội dung"
        cancelLabel="Bỏ qua"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByText("Bỏ qua"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
