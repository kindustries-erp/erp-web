import { describe, expect, it } from "vitest";
import {
  CASHFLOW_CLASSIFICATION_VALUES,
  CASHFLOW_PURPOSE_VALUES,
  CASHFLOW_PURPOSES_BY_CLASSIFICATION,
  isPurposeAllowed,
} from "./cashflowAttributes";

describe("cashflowAttributes", () => {
  it("mọi mục đích đều thuộc ít nhất một phân loại", () => {
    const covered = new Set(
      Object.values(CASHFLOW_PURPOSES_BY_CLASSIFICATION).flat(),
    );
    expect([...covered].sort()).toEqual([...CASHFLOW_PURPOSE_VALUES].sort());
  });

  it("mỗi phân loại đều có danh sách mục đích", () => {
    for (const classification of CASHFLOW_CLASSIFICATION_VALUES) {
      expect(
        CASHFLOW_PURPOSES_BY_CLASSIFICATION[classification].length,
      ).toBeGreaterThan(0);
    }
  });

  it("không có mục đích trùng trong cùng một phân loại", () => {
    for (const purposes of Object.values(CASHFLOW_PURPOSES_BY_CLASSIFICATION)) {
      expect(new Set(purposes).size).toBe(purposes.length);
    }
  });

  it("mục đích rỗng luôn hợp lệ", () => {
    expect(isPurposeAllowed(null, null)).toBe(true);
    expect(isPurposeAllowed("OPERATING", undefined)).toBe(true);
  });

  it("mục đích có nhưng chưa có phân loại thì không hợp lệ", () => {
    expect(isPurposeAllowed(null, "SALARY")).toBe(false);
  });

  it("chỉ hợp lệ khi thuộc đúng phân loại", () => {
    expect(isPurposeAllowed("OPERATING", "SALARY")).toBe(true);
    expect(isPurposeAllowed("INVESTING", "SALARY")).toBe(false);
  });
});
