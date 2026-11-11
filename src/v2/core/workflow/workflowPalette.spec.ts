import { describe, expect, it } from "vitest";

import {
  darken,
  mixWithWhite,
  tonePalette,
  WORKFLOW_BUSINESS_COLORS,
} from "./workflowPalette";

const HEX = /^#[0-9a-f]{6}$/;

describe("mixWithWhite", () => {
  it("0 giữ nguyên màu, 1 ra trắng", () => {
    expect(mixWithWhite("#059669", 0)).toBe("#059669");
    expect(mixWithWhite("#059669", 1)).toBe("#ffffff");
  });

  it("màu trộn với trắng luôn sáng hơn màu gốc", () => {
    const lum = (hex: string) =>
      parseInt(hex.slice(1, 3), 16) +
      parseInt(hex.slice(3, 5), 16) +
      parseInt(hex.slice(5, 7), 16);
    expect(lum(mixWithWhite("#EA580C", 0.5))).toBeGreaterThan(lum("#EA580C"));
  });
});

describe("darken", () => {
  it("làm tối màu, 1 ra đen", () => {
    expect(darken("#ffffff", 1)).toBe("#000000");
    expect(darken("#ffffff", 0)).toBe("#ffffff");
  });
});

describe("tonePalette", () => {
  it("trả đủ 5 màu hex hợp lệ, header nhạt hơn thân lane và viền", () => {
    const palette = tonePalette("#059669");
    [
      palette.header,
      palette.body,
      palette.border,
      palette.text,
      palette.accent,
    ].forEach((value) => expect(value).toMatch(HEX));
    expect(palette.accent).toBe("#059669");
    expect(palette.body).not.toBe(palette.header);
  });
});

describe("WORKFLOW_BUSINESS_COLORS", () => {
  it("lấy màu từ bảng chart dashboard, thu = xanh lá, chi = cam", () => {
    expect(WORKFLOW_BUSINESS_COLORS.income).toBe("#059669");
    expect(WORKFLOW_BUSINESS_COLORS.expense).toBe("#EA580C");
  });
});
