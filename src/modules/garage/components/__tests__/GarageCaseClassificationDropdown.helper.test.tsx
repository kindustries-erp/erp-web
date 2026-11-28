import { describe, it, expect } from "vitest";
import { getClassificationDisplayMeta } from "../organisms/garage-case-classification-dropdown/GarageCaseClassificationDropdown.helper";

const t = (key: string, fallback?: string) =>
  key === "cases.classification.ojHasInvoice"
    ? "Có hóa đơn"
    : (fallback ?? key);

const ojCase = {
  classification: "OJ",
  category: { id: "c", code: "OJ", name: "OJ" },
};

describe("getClassificationDisplayMeta - xe ngoài (OJ)", () => {
  it("OJ đã gắn hóa đơn đầu ra có hậu tố Có hóa đơn", () => {
    expect(
      getClassificationDisplayMeta({ ...ojCase, ojHasInvoice: true }, t).label,
    ).toBe("OJ · Có hóa đơn");
  });

  it("OJ chưa gắn hóa đơn giữ nhãn OJ", () => {
    expect(
      getClassificationDisplayMeta({ ...ojCase, ojHasInvoice: false }, t).label,
    ).toBe("OJ");
  });

  it("phiếu không phải OJ (null) không có hậu tố", () => {
    expect(
      getClassificationDisplayMeta(
        { classification: "KHAC", ojHasInvoice: null },
        (k: string, f?: string) => f ?? k,
      ).label,
    ).not.toContain("·");
  });
});
