import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2ViewConfigDialog } from "./V2StandardTable.viewdialog";

const columns = [
  { key: "code", label: "Mã", canHide: true },
  { key: "name", label: "Tên", canHide: true },
  { key: "id", label: "ID", canHide: false },
];

const renderDialog = (
  overrides: Partial<Parameters<typeof V2ViewConfigDialog>[0]> = {},
) => {
  const props = {
    mode: "create" as const,
    initialName: "",
    columns,
    initialVisibleKeys: ["code", "name", "id"],
    isNameTaken: vi.fn(() => false),
    onSubmit: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  render(<V2ViewConfigDialog {...props} />);
  return props;
};

describe("V2ViewConfigDialog", () => {
  it("không gửi khi tên trống và báo lỗi", () => {
    const { onSubmit } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("Vui lòng nhập tên chế độ xem"),
    ).toBeInTheDocument();
  });

  it("báo lỗi khi tên trùng (không phân biệt hoa thường)", () => {
    const isNameTaken = vi.fn((name: string) => name === "Kế toán");
    const { onSubmit } = renderDialog({ isNameTaken });
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "  Kế toán " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(isNameTaken).toHaveBeenCalledWith("Kế toán");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Tên chế độ xem đã tồn tại")).toBeInTheDocument();
  });

  it("không cho bỏ hết cột ẩn được", () => {
    const { onSubmit } = renderDialog({
      columns: [
        { key: "code", label: "Mã", canHide: true },
        { key: "name", label: "Tên", canHide: true },
      ],
      initialVisibleKeys: ["code", "name"],
    });
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Của tôi" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Bỏ chọn tất cả" }));
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Chọn ít nhất 1 cột")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: "Mã" }));
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Của tôi",
      visibleKeys: ["code"],
    });
  });

  it("cột không ẩn được luôn nằm trong kết quả, nên bỏ hết vẫn hợp lệ", () => {
    const { onSubmit } = renderDialog({ initialName: "Tên" });
    fireEvent.click(screen.getByRole("button", { name: "Bỏ chọn tất cả" }));
    expect(screen.getByRole("checkbox", { name: "ID" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(onSubmit).toHaveBeenCalledWith({ name: "Tên", visibleKeys: ["id"] });
  });

  it("Enter gửi form; chế độ sửa hiện tiêu đề sửa", () => {
    const { onSubmit } = renderDialog({
      mode: "edit",
      initialName: "Cũ",
      initialVisibleKeys: ["code", "id"],
    });
    expect(screen.getByText("Sửa chế độ xem")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Cũ",
      visibleKeys: ["code", "id"],
    });
  });

  it("Hủy gọi onClose", () => {
    const { onClose } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(onClose).toHaveBeenCalled();
  });
});
