import { describe, expect, it } from "vitest";
import { emptyCashVoucherForm } from "../entities/cashVoucher";
import {
  isCashVoucherFormDirty,
  resolveVoucherBranchId,
  validateCashVoucherForm,
} from "./cashVoucherRules";

const filled = {
  ...emptyCashVoucherForm(),
  cashBookId: "cb1",
  transDate: "2026-10-27",
  receiptAmount: 500,
};

describe("validateCashVoucherForm", () => {
  it("hợp lệ khi có sổ quỹ, ngày và đúng một số tiền", () => {
    expect(validateCashVoucherForm(filled)).toBeNull();
  });

  it("báo thiếu sổ quỹ trước, rồi đến ngày", () => {
    expect(validateCashVoucherForm({ ...filled, cashBookId: "" })).toBe(
      "cashBookId",
    );
    expect(validateCashVoucherForm({ ...filled, transDate: "" })).toBe(
      "transDate",
    );
  });

  it("báo lỗi số tiền khi để trống cả Thu và Chi", () => {
    expect(validateCashVoucherForm({ ...filled, receiptAmount: null })).toBe(
      "amount",
    );
  });

  it("báo lỗi số tiền khi nhập cả Thu và Chi", () => {
    expect(validateCashVoucherForm({ ...filled, paymentAmount: 100 })).toBe(
      "amount",
    );
  });
});

describe("resolveVoucherBranchId", () => {
  it("ưu tiên chi nhánh của sổ quỹ", () => {
    expect(resolveVoucherBranchId({ branchId: "b1" }, "b2")).toBe("b1");
  });

  it("dùng chi nhánh đang chọn khi sổ chưa có chi nhánh", () => {
    expect(resolveVoucherBranchId({ branchId: null }, "b2")).toBe("b2");
    expect(resolveVoucherBranchId(undefined, null)).toBeUndefined();
  });
});

describe("isCashVoucherFormDirty", () => {
  it("không bẩn khi form giống trạng thái ban đầu", () => {
    expect(
      isCashVoucherFormDirty(emptyCashVoucherForm(), emptyCashVoucherForm()),
    ).toBe(false);
  });

  it("bẩn khi có trường thay đổi", () => {
    expect(isCashVoucherFormDirty(filled, emptyCashVoucherForm())).toBe(true);
  });
});
