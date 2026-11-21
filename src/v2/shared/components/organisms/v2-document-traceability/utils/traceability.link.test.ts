import { describe, expect, it } from "vitest";
import { resolveLinkTargetDocType } from "./traceability.link";

describe("resolveLinkTargetDocType", () => {
  it("ưu tiên loại chứng từ khi có", () => {
    expect(resolveLinkTargetDocType(undefined, "BANK_TXN")).toBe("BANK_TXN");
    expect(resolveLinkTargetDocType(undefined, "INVOICE")).toBe("INVOICE");
    expect(resolveLinkTargetDocType(undefined, "PURCHASE_ORDER")).toBe(
      "PURCHASE_ORDER",
    );
    expect(resolveLinkTargetDocType(undefined, "SALES_ORDER")).toBe(
      "SALES_ORDER",
    );
    expect(resolveLinkTargetDocType(undefined, "GARAGE_CASE")).toBe(
      "GARAGE_CASE",
    );
  });

  it("suy ra loại đại diện từ giai đoạn khi không có loại chứng từ", () => {
    expect(resolveLinkTargetDocType("PAYMENT")).toBe("BANK_TXN");
    expect(resolveLinkTargetDocType("ORDER_STOCK")).toBe("PURCHASE_ORDER");
    expect(resolveLinkTargetDocType("INVOICE")).toBe("INVOICE");
  });

  it("khớp kết quả cũ khi loại chứng từ và giai đoạn nhất quán", () => {
    expect(resolveLinkTargetDocType("PAYMENT", "BANK_TXN")).toBe("BANK_TXN");
    expect(resolveLinkTargetDocType("ORDER_STOCK", "PURCHASE_ORDER")).toBe(
      "PURCHASE_ORDER",
    );
    expect(resolveLinkTargetDocType("INVOICE", "INVOICE")).toBe("INVOICE");
  });

  it("loại chứng từ thắng giai đoạn khi hai giá trị mâu thuẫn", () => {
    // Phiếu garage nằm ở giai đoạn ORDER_STOCK nhưng không được coi là đơn mua
    expect(resolveLinkTargetDocType("ORDER_STOCK", "GARAGE_CASE")).toBe(
      "GARAGE_CASE",
    );
    expect(resolveLinkTargetDocType("ORDER_STOCK", "SALES_ORDER")).toBe(
      "SALES_ORDER",
    );
  });

  it("dùng giai đoạn khi loại chứng từ không thuộc nhóm ghép nối được", () => {
    expect(resolveLinkTargetDocType("PAYMENT", "GOODS_RECEIPT")).toBe(
      "BANK_TXN",
    );
  });

  it("trả null khi không xác định được", () => {
    expect(resolveLinkTargetDocType()).toBeNull();
    expect(resolveLinkTargetDocType("GENERAL_LEDGER")).toBeNull();
    expect(resolveLinkTargetDocType(undefined, "GOODS_ISSUE")).toBeNull();
  });
});
