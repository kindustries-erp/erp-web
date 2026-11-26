import { describe, expect, it } from "vitest";
import { voucherNameIfDiffers } from "./garageCustomerName.helper";

describe("voucherNameIfDiffers", () => {
  it("trả tên trên phiếu khi khác tên danh mục", () => {
    expect(voucherNameIfDiffers("ACTR", "SAILUN")).toBe("SAILUN");
  });

  it("bỏ qua khi trùng tên danh mục (không phân biệt hoa thường, khoảng trắng)", () => {
    expect(voucherNameIfDiffers("Anh Tư", " anh tư ")).toBeNull();
  });

  it("trả null khi không có tên trên phiếu, giữ tên trên phiếu khi thiếu tên danh mục", () => {
    expect(voucherNameIfDiffers("ACTR", null)).toBeNull();
    expect(voucherNameIfDiffers("ACTR", "  ")).toBeNull();
    expect(voucherNameIfDiffers(null, "Khách lẻ")).toBe("Khách lẻ");
  });
});
