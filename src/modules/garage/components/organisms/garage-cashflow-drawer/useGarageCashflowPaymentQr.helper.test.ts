import { describe, expect, it } from "vitest";

import type { TransferQrAccountOption } from "@/v2/core/transfer-qr-core";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import {
  buildVoucherPrintQr,
  buildVoucherTransferContent,
  isQrAccountNumberInvalid,
  normalizeAccountNumber,
  resolveVoucherQrInfo,
  toQrFields,
  toQrPatchFields,
} from "./useGarageCashflowPaymentQr.helper";

const companyAccounts: TransferQrAccountOption[] = [
  {
    id: "acc-1",
    label: "BIDV - 1240000123456",
    bankCode: "BIDV",
    bin: "970418",
    accountNumber: "1240000123456",
    accountName: "CTY TNHH BLUEWAY",
    logoUrl: null,
  },
];

const voucher = (
  extra: Partial<GarageCashflowVoucher> = {},
): GarageCashflowVoucher => ({
  id: "v-1",
  voucherCode: "PT-001",
  voucherType: "RECEIPT",
  transDate: "2026-11-26",
  amount: 5000000,
  licensePlate: "30A12345",
  createdAt: "",
  updatedAt: "",
  ...extra,
});

describe("buildVoucherTransferContent", () => {
  it("ưu tiên dùng ghi chú (note) làm nội dung chuyển khoản", () => {
    expect(
      buildVoucherTransferContent(voucher({ note: "Thanh toan coc xe" }), {}),
    ).toBe("Thanh toan coc xe");
    expect(
      buildVoucherTransferContent(voucher({ note: "Cu" }), {
        note: "Ghi chu moi",
      }),
    ).toBe("Ghi chu moi");
  });

  it("fallback về mã phiếu + biển số khi không có ghi chú", () => {
    expect(buildVoucherTransferContent(voucher({ note: "" }), {})).toBe(
      "PT-001 30A12345",
    );
  });
});

describe("resolveVoucherQrInfo", () => {
  it("ưu tiên thông tin đã lưu trên phiếu", () => {
    const info = resolveVoucherQrInfo({
      isReceipt: true,
      saved: {
        qrBankBin: "970407",
        qrBankCode: "TCB",
        qrAccountNumber: "999",
        qrTransferContent: "ND rieng",
      },
      defaultContent: "PT-001 30A12345",
      companyAccounts,
      companyName: "BLUEWAY",
    });
    expect(info).toMatchObject({
      bin: "970407",
      bankCode: "TCB",
      accountNumber: "999",
      content: "ND rieng",
    });
  });

  it("phiếu thu chưa lưu dùng tài khoản công ty đầu tiên và tên công ty", () => {
    const info = resolveVoucherQrInfo({
      isReceipt: true,
      saved: {},
      defaultContent: "PT-001",
      companyAccounts,
      companyName: "BLUEWAY",
    });
    expect(info).toMatchObject({
      accountId: "acc-1",
      bin: "970418",
      accountName: "BLUEWAY",
      content: "PT-001",
    });
    expect(toQrFields(info)).toMatchObject({
      qrCompanyAccountId: "acc-1",
      qrBankBin: "970418",
      qrAccountNumber: "1240000123456",
    });
  });

  it("phiếu chi chưa lưu để trống, không lấy tài khoản công ty", () => {
    const info = resolveVoucherQrInfo({
      isReceipt: false,
      saved: {},
      defaultContent: "PC-001",
      companyAccounts,
    });
    expect(info.bin).toBeNull();
    expect(info.accountNumber).toBe("");
  });
});

describe("buildVoucherPrintQr", () => {
  it("phiếu thu đã lưu: có QR và hint ngân hàng", async () => {
    const r = await buildVoucherPrintQr(
      voucher({
        qrBankBin: "970418",
        qrBankCode: "BIDV",
        qrAccountNumber: "123456789",
      }),
      companyAccounts,
    );
    expect(r.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(r.qrBankHint).toBe("BIDV - 123456789");
  });

  it("phiếu chi chưa lưu: không có QR", async () => {
    const r = await buildVoucherPrintQr(
      voucher({ voucherType: "PAYMENT", voucherCode: "PC-001" }),
      companyAccounts,
    );
    expect(r).toEqual({ qrCodeDataUrl: null, qrBankHint: null });
  });

  it("phiếu thu cũ chưa lưu: dùng tài khoản công ty mặc định", async () => {
    const r = await buildVoucherPrintQr(voucher(), companyAccounts, "BLUEWAY");
    expect(r.qrCodeDataUrl).toBeTruthy();
    expect(r.qrBankHint).toBe("BIDV - 1240000123456");
  });
});

describe("số tài khoản và patch QR", () => {
  it("bỏ dấu cách, chấm, gạch", () => {
    expect(normalizeAccountNumber(" 0987 654.321-00 ")).toBe("098765432100");
  });

  it("rỗng là hợp lệ, ký tự lạ hoặc quá 19 ký tự là sai", () => {
    expect(isQrAccountNumberInvalid("")).toBe(false);
    expect(isQrAccountNumberInvalid(null)).toBe(false);
    expect(isQrAccountNumberInvalid("12/34")).toBe(true);
    expect(isQrAccountNumberInvalid("1".repeat(20))).toBe(true);
  });

  it("toQrPatchFields chỉ đổi field có trong patch", () => {
    expect(toQrPatchFields({ accountNumber: "1", content: "" })).toEqual({
      qrAccountNumber: "1",
      qrTransferContent: "",
    });
  });
});
