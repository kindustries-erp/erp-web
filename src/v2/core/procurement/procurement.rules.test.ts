import { describe, expect, it } from "vitest";
import {
  availableProcurementActions,
  cleanProcurementReason,
  PROCUREMENT_ORDER_FROM,
  PROCUREMENT_REQUEST_FROM,
} from "./procurement.rules";

describe("availableProcurementActions", () => {
  it("PO nháp chỉ gửi duyệt được", () => {
    expect(
      availableProcurementActions(PROCUREMENT_ORDER_FROM, "DRAFT"),
    ).toEqual(["submit"]);
  });

  it("PO đã duyệt được phát hành hoặc hủy, không đóng được", () => {
    const actions = availableProcurementActions(
      PROCUREMENT_ORDER_FROM,
      "APPROVED",
    );
    expect(actions).toEqual(expect.arrayContaining(["issue", "cancel"]));
    expect(actions).not.toContain("close");
  });

  it("PO đã phát hành được đóng hoặc hủy", () => {
    expect(
      availableProcurementActions(PROCUREMENT_ORDER_FROM, "ISSUED"),
    ).toEqual(expect.arrayContaining(["cancel", "close"]));
  });

  it("PR đã duyệt được đóng, không phát hành", () => {
    const actions = availableProcurementActions(
      PROCUREMENT_REQUEST_FROM,
      "APPROVED",
    );
    expect(actions).toContain("close");
    expect(actions).not.toContain("issue");
  });

  it("chứng từ đã xóa không có hành động nào", () => {
    expect(
      availableProcurementActions(PROCUREMENT_ORDER_FROM, "DRAFT", true),
    ).toEqual([]);
  });
});

describe("cleanProcurementReason", () => {
  it("trả null khi lý do chỉ có khoảng trắng", () => {
    expect(cleanProcurementReason("   ")).toBeNull();
  });

  it("cắt khoảng trắng hai đầu", () => {
    expect(cleanProcurementReason("  hết hàng ")).toBe("hết hàng");
  });
});
