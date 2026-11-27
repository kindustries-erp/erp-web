import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import type { GarageCashflowVoucher } from "../api/garageCashflowApi";
import { useGarageCashflowPrint } from "./useGarageCashflowPrint";

const { printSpy, captured } = vi.hoisted(() => ({
  printSpy: vi.fn(),
  captured: { options: null as null | Record<string, () => unknown> },
}));
vi.mock("react-to-print", () => ({
  useReactToPrint: (options: Record<string, () => unknown>) => {
    captured.options = options;
    return printSpy;
  },
}));

vi.mock("@/core/api/companyProfileApi", () => ({
  useCompanyProfile: () => ({ data: { company_name: "CTY BLUEWAY" } }),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: [
        {
          id: "acc-1",
          bankName: "BIDV",
          accountNumber: "1240000123456",
          accountName: "CTY TNHH BLUEWAY",
        },
      ],
    })),
  };
});

const voucher = (
  extra: Partial<GarageCashflowVoucher> = {},
): GarageCashflowVoucher => ({
  id: "v-1",
  voucherCode: "PT-001",
  voucherType: "RECEIPT",
  transDate: "2026-11-26",
  amount: 5000000,
  createdAt: "",
  updatedAt: "",
  ...extra,
});

describe("useGarageCashflowPrint", () => {
  it("in từ footer/list (không truyền QR) tự dựng QR từ phiếu", async () => {
    const { result } = renderHook(() => useGarageCashflowPrint());
    await act(() =>
      result.current.printVoucher(
        voucher({
          qrBankBin: "970418",
          qrBankCode: "BIDV",
          qrAccountNumber: "123456789",
        }),
      ),
    );
    expect(result.current.printData?.qrCodeDataUrl).toMatch(/^data:image\/png/);
    expect(result.current.printData?.qrBankHint).toBe("BIDV - 123456789");
    expect(printSpy).toHaveBeenCalled();
  });

  it("phiếu thu cũ chưa lưu dùng tài khoản công ty mặc định", async () => {
    const { result } = renderHook(() => useGarageCashflowPrint());
    await act(() => result.current.printVoucher(voucher()));
    expect(result.current.printData?.qrBankHint).toBe("BIDV - 1240000123456");
  });

  it("phiếu chi chưa lưu thông tin thanh toán in không có QR", async () => {
    const { result } = renderHook(() => useGarageCashflowPrint());
    await act(() =>
      result.current.printVoucher(voucher({ voucherType: "PAYMENT" })),
    );
    expect(result.current.printData?.qrCodeDataUrl ?? null).toBeNull();
  });

  it("dùng nguyên QR truyền vào từ phần QR của drawer", async () => {
    const { result } = renderHook(() => useGarageCashflowPrint());
    await act(() =>
      result.current.printVoucher(voucher(), {
        qrCodeDataUrl: "data:image/png;base64,abc",
        qrBankHint: "TCB - 1",
      }),
    );
    expect(result.current.printData?.qrCodeDataUrl).toBe(
      "data:image/png;base64,abc",
    );
  });

  it("isPrinting bật ngay khi bấm In và tắt khi hộp thoại in sẵn sàng", async () => {
    printSpy.mockClear();
    const { result } = renderHook(() => useGarageCashflowPrint());
    await act(() =>
      result.current.printVoucher(voucher(), {
        qrCodeDataUrl: "data:image/png;base64,abc",
      }),
    );
    expect(result.current.isPrinting).toBe(true);
    expect(printSpy).toHaveBeenCalledTimes(1);

    await act(() => (captured.options?.onBeforePrint as () => Promise<void>)());
    expect(result.current.isPrinting).toBe(false);
  });

  it("bấm In liên tiếp khi đang chuẩn bị chỉ in một lần", async () => {
    printSpy.mockClear();
    const { result } = renderHook(() => useGarageCashflowPrint());
    await act(async () => {
      await Promise.all([
        result.current.printVoucher(voucher(), {
          qrCodeDataUrl: "data:image/png;base64,abc",
        }),
        result.current.printVoucher(voucher(), {
          qrCodeDataUrl: "data:image/png;base64,abc",
        }),
      ]);
    });
    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  it("lỗi in tắt isPrinting", async () => {
    const { result } = renderHook(() => useGarageCashflowPrint());
    await act(() =>
      result.current.printVoucher(voucher(), {
        qrCodeDataUrl: "data:image/png;base64,abc",
      }),
    );
    expect(result.current.isPrinting).toBe(true);

    await act(async () => {
      (captured.options?.onPrintError as () => void)();
    });
    expect(result.current.isPrinting).toBe(false);
  });
});
