import { describe, expect, it } from "vitest";
import { emptyGarageGoodsReceiptForm } from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";
import {
  isGarageGoodsReceiptFormDirty,
  validateGarageGoodsReceiptForm,
} from "./garageGoodsReceiptRules";

describe("validateGarageGoodsReceiptForm", () => {
  it("reports the first blank required field", () => {
    const blank = { ...emptyGarageGoodsReceiptForm(), receiptDate: "" };
    expect(validateGarageGoodsReceiptForm(blank)).toBe("receiptDate");
  });

  it("accepts a form with every required field filled", () => {
    const form = {
      ...emptyGarageGoodsReceiptForm(),
      receiptDate: "2026-11-03",
    };
    expect(validateGarageGoodsReceiptForm(form)).toBeNull();
  });
});

describe("isGarageGoodsReceiptFormDirty", () => {
  it("detects changes against the initial snapshot", () => {
    const initial = emptyGarageGoodsReceiptForm();
    expect(isGarageGoodsReceiptFormDirty({ ...initial }, initial)).toBe(false);
    expect(
      isGarageGoodsReceiptFormDirty(
        { ...initial, remarks: "Thay đổi ghi chú" },
        initial,
      ),
    ).toBe(true);
  });
});
