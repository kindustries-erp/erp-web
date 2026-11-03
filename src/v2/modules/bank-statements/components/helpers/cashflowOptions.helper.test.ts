import { describe, expect, it } from "vitest";
import {
  buildClassificationOptions,
  buildPurposeOptions,
  getClassificationLabel,
  getPurposeLabel,
} from "./cashflowOptions.helper";

/** Dịch giả: trả về chính khóa để kiểm tra đúng khóa đã gọi */
const echo = (key: string) => key;

describe("cashflowOptions.helper", () => {
  it("nhãn phân loại tra theo khóa v2.bankStatements.cashflow.classification", () => {
    expect(getClassificationLabel(echo, "OPERATING")).toBe(
      "v2.bankStatements.cashflow.classification.OPERATING",
    );
  });

  it("nhãn mục đích tra theo khóa v2.bankStatements.cashflow.purpose", () => {
    expect(getPurposeLabel(echo, "SALARY")).toBe(
      "v2.bankStatements.cashflow.purpose.SALARY",
    );
  });

  it("trả ô trống khi giá trị rỗng hoặc không hợp lệ", () => {
    expect(getClassificationLabel(echo, null)).toBe("—");
    expect(getPurposeLabel(echo, "UNKNOWN")).toBe("—");
  });

  it("danh sách phân loại đủ 4 mục", () => {
    expect(buildClassificationOptions(echo)).toHaveLength(4);
  });

  it("mục đích rỗng khi chưa chọn phân loại", () => {
    expect(buildPurposeOptions(echo, null)).toEqual([]);
  });

  it("mục đích chỉ gồm các mục thuộc phân loại đã chọn", () => {
    const values = buildPurposeOptions(echo, "FINANCING").map((o) => o.value);
    expect(values).toEqual(["LOAN", "CAPITAL", "OTHER"]);
  });
});
