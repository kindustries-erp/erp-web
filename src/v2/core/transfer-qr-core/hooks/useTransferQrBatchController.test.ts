import { act, renderHook, waitFor } from "@testing-library/react";
import QRCode from "qrcode";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_BATCH_ROWS } from "../domain/rules/batchRows";
import { downloadBatchZip } from "../helpers/batchDownloads";
import { useTransferQrBatchController } from "./useTransferQrBatchController";

vi.mock("qrcode", () => ({
  default: { toDataURL: vi.fn(async () => "data:image/png;base64,QR") },
}));

vi.mock("../helpers/batchDownloads", () => ({
  downloadBatchZip: vi.fn(async () => undefined),
  downloadBatchPdf: vi.fn(async () => undefined),
  downloadRowCard: vi.fn(async () => undefined),
}));

const PASTE_OK = "VCB\t0123456789\tNGUYEN VAN A\t1.500.000\tHD001/2025";

describe("useTransferQrBatchController", () => {
  beforeEach(() => {
    vi.mocked(QRCode.toDataURL).mockClear();
  });

  it("dòng chưa đủ thông tin không có QR", () => {
    const { result } = renderHook(() =>
      useTransferQrBatchController({ open: true }),
    );
    act(() => result.current.addRow());
    expect(result.current.views).toHaveLength(1);
    expect(result.current.views[0].valid).toBe(false);
    expect(result.current.views[0].qrDataUrl).toBeNull();
    expect(QRCode.toDataURL).not.toHaveBeenCalled();
  });

  it("dán dòng hợp lệ thì có QR, nội dung trong payload đã đổi ký tự đặc biệt thành dấu cách", async () => {
    const { result } = renderHook(() =>
      useTransferQrBatchController({ open: true }),
    );
    act(() => result.current.applyPaste(PASTE_OK));
    const view = result.current.views[0];
    expect(view.valid).toBe(true);
    expect(view.caption.content).toBe("HD001 2025");
    await waitFor(() =>
      expect(result.current.views[0].qrDataUrl).toBe(
        "data:image/png;base64,QR",
      ),
    );
    const payload = vi.mocked(QRCode.toDataURL).mock.calls[0][0] as string;
    expect(payload).toContain("HD001 2025");
    expect(payload).toContain("0123456789");
    expect(result.current.views[0].fileName).toBe(
      "01_QR_VCB_0123456789_1500000.png",
    );
  });

  it("số tiền không đọc được thì dòng báo lỗi và không có QR", () => {
    const { result } = renderHook(() =>
      useTransferQrBatchController({ open: true }),
    );
    act(() => result.current.applyPaste("VCB\t0123456789\tA\t12a\tx"));
    expect(result.current.views[0].errors.amount).toBe("invalidAmount");
    expect(result.current.views[0].qrDataUrl).toBeNull();
    expect(result.current.validCount).toBe(0);
  });

  it("không thêm quá MAX_BATCH_ROWS dòng", () => {
    const { result } = renderHook(() =>
      useTransferQrBatchController({ open: true }),
    );
    act(() => {
      for (let i = 0; i < MAX_BATCH_ROWS + 5; i++) result.current.addRow();
    });
    expect(result.current.views).toHaveLength(MAX_BATCH_ROWS);
    expect(result.current.canAddRow).toBe(false);
  });

  it("dán thêm vào cuối và bỏ dòng trống đang có", () => {
    const { result } = renderHook(() =>
      useTransferQrBatchController({ open: true }),
    );
    act(() => result.current.addRow());
    act(() => result.current.applyPaste(`${PASTE_OK}\nTCB\t19011\tB\t200\ty`));
    expect(result.current.views).toHaveLength(2);
    expect(result.current.views.map((v) => v.row.bankCode)).toEqual([
      "VCB",
      "TCB",
    ]);
  });

  it("báo khi bảng dán có tiêu đề và khi bị cắt", () => {
    const { result } = renderHook(() =>
      useTransferQrBatchController({ open: true }),
    );
    const lines = Array.from(
      { length: MAX_BATCH_ROWS + 1 },
      (_, i) => `VCB\t${1000 + i}\tA\t100\tx`,
    );
    act(() =>
      result.current.applyPaste(
        ["Ngân hàng\tSố tài khoản", ...lines].join("\n"),
      ),
    );
    expect(result.current.pasteNotice).toEqual({
      skippedHeader: true,
      truncated: true,
    });
    expect(result.current.views).toHaveLength(MAX_BATCH_ROWS);
  });

  it("đóng drawer thì xóa toàn bộ danh sách", () => {
    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) => useTransferQrBatchController({ open }),
      { initialProps: { open: true } },
    );
    act(() => result.current.applyPaste(PASTE_OK));
    expect(result.current.views).toHaveLength(1);
    rerender({ open: false });
    expect(result.current.views).toHaveLength(0);
    expect(result.current.pasteNotice).toBeNull();
  });

  it("tải ZIP lỗi thì đặt downloadFailed, không để lỗi bị nuốt", async () => {
    vi.mocked(downloadBatchZip).mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() =>
      useTransferQrBatchController({ open: true }),
    );
    act(() => result.current.applyPaste(PASTE_OK));
    await waitFor(() => expect(result.current.validCount).toBe(1));

    await act(async () => {
      await result.current.downloadZip();
    });

    expect(result.current.downloadFailed).toBe(true);
  });

  it("tải thành công sau lần lỗi thì xóa downloadFailed", async () => {
    vi.mocked(downloadBatchZip).mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() =>
      useTransferQrBatchController({ open: true }),
    );
    act(() => result.current.applyPaste(PASTE_OK));
    await waitFor(() => expect(result.current.validCount).toBe(1));
    await act(async () => {
      await result.current.downloadZip();
    });
    await act(async () => {
      await result.current.downloadZip();
    });
    expect(result.current.downloadFailed).toBe(false);
  });

  it("QR của phiên cũ resolve sau khi đóng drawer không được ghi vào cache", async () => {
    let resolveOld!: (url: string) => void;
    vi.mocked(QRCode.toDataURL).mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          resolveOld = resolve;
        }) as never,
    );
    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) => useTransferQrBatchController({ open }),
      { initialProps: { open: true } },
    );
    act(() => result.current.applyPaste(PASTE_OK));
    rerender({ open: false });
    rerender({ open: true });

    await act(async () => resolveOld("data:image/png;base64,OLD"));
    act(() => result.current.applyPaste(PASTE_OK));

    await waitFor(() =>
      expect(result.current.views[0].qrDataUrl).toBe(
        "data:image/png;base64,QR",
      ),
    );
  });
});
