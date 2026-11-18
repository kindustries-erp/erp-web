import { describe, expect, it } from "vitest";
import {
  bankFieldsFromBin,
  buildBatchFileName,
  createBatchRow,
  isBatchRowValid,
  validateBatchRow,
} from "./batchRows";

describe("bankFieldsFromBin", () => {
  it("đổi ngân hàng thì mã viết tắt đi cùng BIN, không giữ mã cũ", () => {
    expect(bankFieldsFromBin("970436")).toEqual({
      bin: "970436",
      bankCode: "VCB",
    });
    expect(bankFieldsFromBin(null)).toEqual({ bin: null, bankCode: "" });
  });
});

const validRow = () =>
  createBatchRow("r1", {
    bin: "970436",
    bankCode: "VCB",
    accountNumber: "0123456789",
    accountName: "NGUYEN VAN A",
    amount: 1500000,
    content: "HD001/2025",
  });

describe("validateBatchRow", () => {
  it("dòng hợp lệ không có lỗi", () => {
    expect(validateBatchRow(validRow())).toEqual({});
    expect(isBatchRowValid(validRow())).toBe(true);
  });

  it("dòng trống báo đủ các ô bắt buộc", () => {
    expect(validateBatchRow(createBatchRow("r2"))).toEqual({
      bin: "required",
      accountNumber: "required",
      accountName: "required",
    });
  });

  it("số tài khoản sai định dạng và số tiền không đọc được đều báo lỗi", () => {
    const row = {
      ...validRow(),
      accountNumber: "12-34",
      amountInvalid: true,
    };
    expect(validateBatchRow(row)).toEqual({
      accountNumber: "invalidAccountNumber",
      amount: "invalidAmount",
    });
  });

  it("số tiền vượt giới hạn hoặc không nguyên dương là lỗi", () => {
    expect(validateBatchRow({ ...validRow(), amount: 0 })).toMatchObject({
      amount: "invalidAmount",
    });
  });

  it("số tiền để trống là hợp lệ (QR tĩnh)", () => {
    expect(validateBatchRow({ ...validRow(), amount: null })).toEqual({});
  });
});

describe("buildBatchFileName", () => {
  it("có số thứ tự và số tiền", () => {
    expect(buildBatchFileName(1, validRow())).toBe(
      "01_QR_VCB_0123456789_1500000.png",
    );
  });

  it("không có số tiền thì bỏ phần tiền", () => {
    expect(buildBatchFileName(12, { ...validRow(), amount: null })).toBe(
      "12_QR_VCB_0123456789.png",
    );
  });

  it("hai dòng giống hệt nhau vẫn khác tên nhờ số thứ tự", () => {
    expect(buildBatchFileName(1, validRow())).not.toBe(
      buildBatchFileName(2, validRow()),
    );
  });
});
