import { describe, expect, it } from "vitest";
import {
  clampNumber,
  formatNumberValue,
  parseNumberText,
  sanitizeNumberText,
  toEditableText,
} from "./V2NumberInput.helper";

const int = { decimals: 0, allowNegative: false };
const dec = { decimals: 2, allowNegative: true };

describe("V2NumberInput helpers", () => {
  it("strips invalid characters and thousand separators", () => {
    expect(sanitizeNumberText("1.234abc", int)).toBe("1234");
  });

  it("drops the decimal separator for integers", () => {
    expect(sanitizeNumberText("12,5", int)).toBe("125");
  });

  it("keeps one decimal separator and limits decimals", () => {
    expect(sanitizeNumberText("1,234,567", dec)).toBe("1,23");
  });

  it("keeps a leading minus only when negatives are allowed", () => {
    expect(sanitizeNumberText("-5", dec)).toBe("-5");
    expect(sanitizeNumberText("-5", int)).toBe("5");
  });

  it("parses text to a number", () => {
    expect(parseNumberText("1.250,5", { ...dec, decimals: 1 })).toBe(1250.5);
    expect(parseNumberText("-3", dec)).toBe(-3);
  });

  it("returns null for empty or incomplete input", () => {
    expect(parseNumberText("", int)).toBeNull();
    expect(parseNumberText("-", dec)).toBeNull();
    expect(parseNumberText(",", dec)).toBeNull();
  });

  it("formats with vi-VN separators", () => {
    expect(formatNumberValue(1234567.5, 2, "vi-VN")).toBe("1.234.567,5");
    expect(formatNumberValue(null, 2, "vi-VN")).toBe("");
  });

  it("builds editable text with a decimal comma", () => {
    expect(toEditableText(1250.5)).toBe("1250,5");
    expect(toEditableText(null)).toBe("");
  });

  it("clamps to min and max", () => {
    expect(clampNumber(5, 10, 20)).toBe(10);
    expect(clampNumber(50, 10, 20)).toBe(20);
    expect(clampNumber(15)).toBe(15);
  });
});
