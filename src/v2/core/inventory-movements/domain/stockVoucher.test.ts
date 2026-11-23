import { describe, expect, it } from "vitest";
import {
  isStockVoucherPosted,
  sumStockVoucherLines,
} from "./stockVoucherRules";

describe("stockVoucherRules", () => {
  it("nhận biết phiếu đã ghi sổ", () => {
    expect(isStockVoucherPosted("POSTED")).toBe(true);
    expect(isStockVoucherPosted("DRAFT")).toBe(false);
    expect(isStockVoucherPosted(null)).toBe(false);
  });

  it("cộng thành tiền các dòng, bỏ qua giá trị không hợp lệ", () => {
    expect(
      sumStockVoucherLines([{ amount: 10 }, { amount: 2.5 }, { amount: NaN }]),
    ).toBe(12.5);
  });
});
