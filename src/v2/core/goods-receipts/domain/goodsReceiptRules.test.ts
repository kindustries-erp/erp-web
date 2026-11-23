import { describe, expect, it } from "vitest";
import {
  calcGoodsReceiptLineAmount,
  isGoodsReceiptFormDirty,
  sumGoodsReceiptLineAmounts,
  sumGoodsReceiptLineQuantities,
  validateGoodsReceiptForm,
} from "./goodsReceiptRules";
import { emptyGoodsReceiptForm } from "./goodsReceipt";

describe("goodsReceiptRules", () => {
  it("nhân số lượng với đơn giá", () => {
    expect(calcGoodsReceiptLineAmount("2", "500000")).toBe(1_000_000);
  });

  it("coi giá trị không hợp lệ là 0", () => {
    expect(calcGoodsReceiptLineAmount("", "abc")).toBe(0);
  });

  it("cộng thành tiền và số lượng của các dòng", () => {
    const lines = [
      { qtyReceived: "2", amount: "1000000" },
      { qtyReceived: "3", amount: "250000" },
    ];
    expect(sumGoodsReceiptLineAmounts(lines)).toBe(1_250_000);
    expect(sumGoodsReceiptLineQuantities(lines)).toBe(5);
  });
});

describe("validateGoodsReceiptForm", () => {
  it("báo trường bắt buộc đầu tiên đang trống theo danh sách truyền vào", () => {
    const blank = { ...emptyGoodsReceiptForm(), receiptDate: "" };
    expect(validateGoodsReceiptForm(blank, ["receiptDate"])).toBe(
      "receiptDate",
    );
  });

  it("không báo lỗi khi các trường bắt buộc đã có giá trị", () => {
    const form = { ...emptyGoodsReceiptForm(), receiptDate: "2026-11-03" };
    expect(validateGoodsReceiptForm(form, ["receiptDate"])).toBeNull();
  });

  it("không kiểm tra trường không nằm trong danh sách bắt buộc", () => {
    const form = {
      ...emptyGoodsReceiptForm(),
      receiptDate: "2026-11-03",
      remarks: "",
    };
    expect(validateGoodsReceiptForm(form, ["receiptDate"])).toBeNull();
  });
});

describe("isGoodsReceiptFormDirty", () => {
  it("phát hiện thay đổi so với snapshot ban đầu", () => {
    const initial = emptyGoodsReceiptForm();
    expect(isGoodsReceiptFormDirty({ ...initial }, initial)).toBe(false);
    expect(
      isGoodsReceiptFormDirty(
        { ...initial, remarks: "Thay đổi ghi chú" },
        initial,
      ),
    ).toBe(true);
  });
});
