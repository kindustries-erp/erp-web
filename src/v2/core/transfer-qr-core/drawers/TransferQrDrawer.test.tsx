import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TransferQrDrawer } from "./TransferQrDrawer";

vi.mock("qrcode", () => ({
  default: { toDataURL: vi.fn(async () => "data:image/png;base64,QR") },
}));

const accounts = [
  {
    id: "acc-1",
    label: "VCB - 0123456789",
    bankCode: "VCB",
    bin: "970436",
    accountNumber: "0123456789",
    accountName: "CONG TY ABC",
  },
];

describe("TransferQrDrawer", () => {
  it("hiển thị tiêu đề, hai chế độ và nút tải ở trạng thái chưa đủ dữ liệu", () => {
    render(<TransferQrDrawer open onClose={vi.fn()} accounts={accounts} />);
    expect(screen.getByText("Tạo mã QR chuyển khoản")).toBeTruthy();
    expect(screen.getByText("Trả tiền nhà cung cấp")).toBeTruthy();
    expect(screen.getByText("Nhận tiền từ khách")).toBeTruthy();
    const download = screen.getByRole("button", { name: "Tải ảnh QR (PNG)" });
    expect((download as HTMLButtonElement).disabled).toBe(true);
  });

  it("chuyển sang tab nhiều lệnh thì hiện bảng dán từ Excel và nút thêm dòng", () => {
    render(<TransferQrDrawer open onClose={vi.fn()} accounts={accounts} />);
    expect(screen.queryByRole("textbox", { name: "Dán từ Excel" })).toBeNull();

    fireEvent.click(screen.getByText("Nhiều lệnh thanh toán"));

    expect(screen.getByRole("textbox", { name: "Dán từ Excel" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Thêm dòng" })).toBeTruthy();
    expect(
      (
        screen.getByRole("button", {
          name: "Tải ZIP tất cả",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  it("ô chưa nhập không hiện lỗi đỏ; chỉ hiện sau khi rời khỏi ô", () => {
    render(<TransferQrDrawer open onClose={vi.fn()} accounts={accounts} />);
    const requiredText = "Vui lòng nhập thông tin này";
    expect(screen.queryAllByText(requiredText)).toHaveLength(0);

    fireEvent.focusOut(screen.getByRole("textbox", { name: "Số tài khoản" }));

    expect(screen.queryAllByText(requiredText).length).toBeGreaterThan(0);
  });

  it("đóng khi chưa có dữ liệu thì đóng luôn; có dữ liệu thì hỏi xác nhận", () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <TransferQrDrawer open onClose={onClose} accounts={accounts} />,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();

    const onClose2 = vi.fn();
    render(<TransferQrDrawer open onClose={onClose2} accounts={accounts} />);
    fireEvent.change(
      screen.getByRole("textbox", { name: "Tên chủ tài khoản" }),
      {
        target: { value: "CONG TY ABC" },
      },
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose2).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Đóng không lưu" })).toBeTruthy();
  });

  it("quay lại tab một mã thì giữ nguyên nút tải của chế độ đơn", () => {
    render(<TransferQrDrawer open onClose={vi.fn()} accounts={accounts} />);
    fireEvent.click(screen.getByText("Nhiều lệnh thanh toán"));
    fireEvent.click(screen.getByText("Một mã QR"));
    expect(
      screen.getByRole("button", { name: "Tải ảnh QR (PNG)" }),
    ).toBeTruthy();
  });

  it("chế độ nhận tiền hiển thị thông tin công ty và MST trên Thẻ thanh toán", async () => {
    render(
      <TransferQrDrawer
        open
        onClose={vi.fn()}
        accounts={accounts}
        companyInfo={{
          companyName: "CÔNG TY TNHH GREENWAY",
          taxCode: "0109998888",
        }}
      />,
    );

    fireEvent.click(screen.getByText("Nhận tiền từ khách"));
    fireEvent.click(screen.getByText("Chọn tài khoản"));
    fireEvent.click(screen.getByText("VCB - 0123456789"));

    await vi.waitFor(() => {
      expect(
        screen.getAllByText("CÔNG TY TNHH GREENWAY").length,
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/0109998888/)).toBeTruthy();
      expect(screen.getByText("0123456789")).toBeTruthy();
    });
  });
});
