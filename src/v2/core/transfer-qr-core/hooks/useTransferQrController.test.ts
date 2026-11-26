import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QRCode from "qrcode";
import {
  TransferQrMode,
  type TransferQrAccountOption,
} from "../transferQr.types";
import { useTransferQrController } from "./useTransferQrController";

vi.mock("qrcode", () => ({
  default: { toDataURL: vi.fn(async () => "data:image/png;base64,QR") },
}));

const accounts: TransferQrAccountOption[] = [
  {
    id: "acc-1",
    label: "VCB - 0123456789",
    bankCode: "VCB",
    bin: "970436",
    accountNumber: "0123456789",
    accountName: "CONG TY ABC",
  },
  {
    id: "acc-2",
    label: "XYZ - 999",
    bankCode: "XYZ",
    bin: null,
    accountNumber: "999",
    accountName: "CONG TY ABC",
  },
];

/** Chuỗi VietQR được truyền cho lần gọi QRCode gần nhất. */
const lastPayload = (): string => {
  const calls = vi.mocked(QRCode.toDataURL).mock.calls;
  return calls[calls.length - 1]?.[0] as string;
};

describe("useTransferQrController", () => {
  beforeEach(() => {
    vi.mocked(QRCode.toDataURL).mockClear();
  });

  it("chế độ nhận tiền: chọn tài khoản công ty thì tạo QR tĩnh", async () => {
    const { result } = renderHook(() =>
      useTransferQrController({ open: true, accounts }),
    );
    expect(result.current.qrDataUrl).toBeNull();

    act(() => {
      result.current.patchForm({
        mode: TransferQrMode.RECEIVE_FROM_CUSTOMER,
        accountId: "acc-1",
      });
    });

    await vi.waitFor(() =>
      expect(result.current.qrDataUrl).toBe("data:image/png;base64,QR"),
    );
    const payload = lastPayload();
    expect(payload).toContain("970436");
    expect(payload).toContain("0123456789");
    const topLevelTags = new Set<string>();
    for (let i = 0; i < payload.length; ) {
      topLevelTags.add(payload.slice(i, i + 2));
      i += 4 + Number(payload.slice(i + 2, i + 4));
    }
    expect(topLevelTags.has("54")).toBe(false); // QR tĩnh: không có tag số tiền
  });

  it("chế độ nhận tiền: tài khoản không khớp ngân hàng thì yêu cầu chọn BIN tay", () => {
    const { result } = renderHook(() =>
      useTransferQrController({ open: true, accounts }),
    );
    act(() => {
      result.current.patchForm({
        mode: TransferQrMode.RECEIVE_FROM_CUSTOMER,
        accountId: "acc-2",
      });
    });
    expect(result.current.errors.bin).toBe("required");
    expect(result.current.qrDataUrl).toBeNull();
  });

  it("chế độ nhận tiền: số tài khoản ERP không hợp lệ thì không tạo QR", () => {
    const bad: TransferQrAccountOption[] = [
      { ...accounts[0], id: "acc-bad", accountNumber: "a/c 123-456" },
    ];
    const { result } = renderHook(() =>
      useTransferQrController({ open: true, accounts: bad }),
    );
    act(() => {
      result.current.patchForm({
        mode: TransferQrMode.RECEIVE_FROM_CUSTOMER,
        accountId: "acc-bad",
      });
    });
    expect(result.current.errors.accountNumber).toBe("invalidAccountNumber");
    expect(result.current.qrDataUrl).toBeNull();
    expect(QRCode.toDataURL).not.toHaveBeenCalled();
  });

  it("chế độ nhận tiền: BIN dự phòng chọn tay thì mã viết tắt theo BIN đó", () => {
    const { result } = renderHook(() =>
      useTransferQrController({ open: true, accounts }),
    );
    act(() => {
      result.current.patchForm({
        mode: TransferQrMode.RECEIVE_FROM_CUSTOMER,
        accountId: "acc-2",
        bin: "970436",
      });
    });
    expect(result.current.target?.bankCode).toBe("VCB");
  });

  it("đổi chế độ thì xóa BIN của chế độ cũ, không rò sang chế độ nhận tiền", () => {
    const { result } = renderHook(() =>
      useTransferQrController({ open: true, accounts }),
    );
    act(() => {
      result.current.patchForm({ bin: "970436" });
    });
    act(() => {
      result.current.patchForm({
        mode: TransferQrMode.RECEIVE_FROM_CUSTOMER,
        accountId: "acc-2",
      });
    });
    expect(result.current.form.bin).toBeNull();
    expect(result.current.errors.bin).toBe("required");
    expect(result.current.qrDataUrl).toBeNull();
  });

  it("chế độ trả NCC: thiếu thông tin thì báo lỗi và không tạo QR", () => {
    const { result } = renderHook(() =>
      useTransferQrController({ open: true, accounts }),
    );
    act(() => {
      result.current.patchForm({ accountNumber: "12-34" });
    });
    expect(result.current.errors).toMatchObject({
      bin: "required",
      accountNumber: "invalidAccountNumber",
    });
    expect(result.current.errors.accountName).toBeUndefined();
    expect(QRCode.toDataURL).not.toHaveBeenCalled();
  });

  it("chế độ trả NCC không nhập accountName vẫn tạo được QR hợp lệ", async () => {
    const { result } = renderHook(() =>
      useTransferQrController({ open: true, accounts }),
    );
    act(() => {
      result.current.patchForm({
        bin: "970436",
        accountNumber: "0123456789",
        accountName: "",
        amount: 500000,
        content: "HD-123",
      });
    });
    await vi.waitFor(() => expect(result.current.canDownload).toBe(true));
    expect(result.current.errors).toEqual({});
    expect(result.current.qrDataUrl).toBe("data:image/png;base64,QR");
  });

  it("chế độ trả NCC đủ thông tin và có số tiền: tạo QR động và tên file có số tiền", async () => {
    const { result } = renderHook(() =>
      useTransferQrController({ open: true, accounts }),
    );
    act(() => {
      result.current.patchForm({
        bin: "970436",
        accountNumber: "0123456789",
        accountName: "NCC XYZ",
        amount: 1500000,
        content: "Thanh toan NCC",
      });
    });
    await vi.waitFor(() => expect(result.current.canDownload).toBe(true));
    const payload = lastPayload();
    expect(payload).toContain("54071500000"); // tag 54, độ dài 07, giá trị 1500000
    expect(result.current.errors).toEqual({});
  });

  it("hỗ trợ tải Thẻ thanh toán (downloadCard) và tải QR thô (downloadRaw)", async () => {
    const { result } = renderHook(() =>
      useTransferQrController({ open: true, accounts }),
    );
    act(() => {
      result.current.patchForm({
        mode: TransferQrMode.RECEIVE_FROM_CUSTOMER,
        accountId: "acc-1",
      });
    });
    await vi.waitFor(() => expect(result.current.canDownload).toBe(true));

    expect(typeof result.current.downloadCard).toBe("function");
    expect(typeof result.current.downloadRaw).toBe("function");
    expect(result.current.cardRef).toBeDefined();
  });

  it("đóng drawer thì reset form", () => {
    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) =>
        useTransferQrController({ open, accounts }),
      { initialProps: { open: true } },
    );
    act(() => {
      result.current.patchForm({ accountNumber: "123" });
    });
    rerender({ open: false });
    expect(result.current.form.accountNumber).toBe("");
  });
});
