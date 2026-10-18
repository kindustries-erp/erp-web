import { describe, it, expect } from "vitest";
import { formatUom } from "../uom.helper";

describe("uom.helper - formatUom", () => {
  it("should return fallback for null, undefined, empty or whitespace string", () => {
    expect(formatUom(null)).toBe("—");
    expect(formatUom(undefined)).toBe("—");
    expect(formatUom("")).toBe("—");
    expect(formatUom("   ")).toBe("—");
    expect(formatUom(null, "N/A")).toBe("N/A");
  });

  it("should convert lowercase and mixed-case units to uppercase", () => {
    expect(formatUom("cái")).toBe("CÁI");
    expect(formatUom("bộ")).toBe("BỘ");
    expect(formatUom("chiếc")).toBe("CHIẾC");
    expect(formatUom("lần")).toBe("LẦN");
    expect(formatUom("bình")).toBe("BÌNH");
    expect(formatUom("kg")).toBe("KG");
    expect(formatUom("Chai")).toBe("CHAI");
  });

  it("should handle multi-word units with extra whitespace", () => {
    expect(formatUom("  gói   dịch vụ  ")).toBe("GÓI DỊCH VỤ");
    expect(formatUom("giờ công")).toBe("GIỜ CÔNG");
  });
});
