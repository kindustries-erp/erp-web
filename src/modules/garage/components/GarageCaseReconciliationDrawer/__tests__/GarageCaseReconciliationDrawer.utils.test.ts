import { describe, it, expect } from "vitest";
import { readVietnameseCurrency } from "../utils";

describe("GarageCaseReconciliationDrawer utils: readVietnameseCurrency", () => {
  it("returns empty string for zero, negative or NaN values", () => {
    expect(readVietnameseCurrency(0)).toBe("");
    expect(readVietnameseCurrency(-1000)).toBe("");
    expect(readVietnameseCurrency(NaN)).toBe("");
  });

  it("formats standard amounts correctly in Vietnamese words", () => {
    expect(readVietnameseCurrency(1000)).toBe("Một nghìn đồng");
    expect(readVietnameseCurrency(100000)).toBe("Một trăm nghìn đồng");
    expect(readVietnameseCurrency(1500000)).toBe(
      "Một triệu năm trăm nghìn đồng",
    );
    expect(readVietnameseCurrency(12500000)).toBe(
      "Mười hai triệu năm trăm nghìn đồng",
    );
    expect(readVietnameseCurrency(105000000)).toBe(
      "Một trăm lẻ năm triệu đồng",
    );
  });

  it("handles numbers ending in 1 (mốt) and 5 (lăm)", () => {
    expect(readVietnameseCurrency(21000)).toBe("Hai mươi mốt nghìn đồng");
    expect(readVietnameseCurrency(25000)).toBe("Hai mươi lăm nghìn đồng");
    expect(readVietnameseCurrency(15000)).toBe("Mười lăm nghìn đồng");
  });
});
