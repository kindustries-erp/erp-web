import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatAmountOptionLabel,
  formatCompositeFilterValue,
  formatNumberOptionLabel,
  getDefaultPageSize,
  normalizePageSize,
} from "./v2TableFormat";

describe("getDefaultPageSize", () => {
  it("returns 20 below 900px and 50 from 900px up", () => {
    expect(getDefaultPageSize(899)).toBe(20);
    expect(getDefaultPageSize(900)).toBe(50);
    expect(getDefaultPageSize(1440)).toBe(50);
  });

  it("falls back to window.innerHeight when no height is given", () => {
    const original = window.innerHeight;
    Object.defineProperty(window, "innerHeight", {
      value: 1000,
      configurable: true,
    });
    expect(getDefaultPageSize()).toBe(50);
    Object.defineProperty(window, "innerHeight", {
      value: original,
      configurable: true,
    });
  });
});

describe("normalizePageSize", () => {
  it("keeps supported sizes and replaces unsupported ones", () => {
    expect(normalizePageSize(100)).toBe(100);
    expect(normalizePageSize(7)).toBe(getDefaultPageSize());
  });
});

describe("formatCompositeFilterValue", () => {
  it("formats primary and secondary parts without leaking the separator", () => {
    expect(formatCompositeFilterValue("1066:::C25MDP")).toBe("1066 (C25MDP)");
    expect(formatCompositeFilterValue(":::C25THP")).toBe("(C25THP)");
    expect(formatCompositeFilterValue("1066:::")).toBe("1066");
    expect(formatCompositeFilterValue("plain")).toBe("plain");
  });

  it("maps the blank sentinel to the provided label", () => {
    expect(formatCompositeFilterValue("__BLANK__", "(Trống)")).toBe("(Trống)");
    expect(formatCompositeFilterValue("__BLANK__")).toBe("__BLANK__");
  });
});

describe("number and amount labels", () => {
  it("adds thousand separators for numeric values", () => {
    expect(formatAmount(10000000)).toBe("10.000.000 đ");
    expect(formatAmountOptionLabel("10000000")).toBe("10.000.000 đ");
    expect(formatNumberOptionLabel("1250")).toBe("1.250");
  });

  it("keeps non numeric values untouched", () => {
    expect(formatAmountOptionLabel("n/a")).toBe("n/a");
    expect(formatNumberOptionLabel("")).toBe("");
  });
});
