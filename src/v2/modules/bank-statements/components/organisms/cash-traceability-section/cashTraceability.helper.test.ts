import { describe, expect, it } from "vitest";
import { toOpenDocumentDetail } from "./cashTraceability.helper";

describe("toOpenDocumentDetail", () => {
  it("đổi hóa đơn và giao dịch ngân hàng sang đúng tên sự kiện V1", () => {
    expect(toOpenDocumentDetail("INVOICE", "i1")).toEqual({
      type: "erp_invoice",
      id: "i1",
    });
    expect(toOpenDocumentDetail("BANK_TXN", "t1")).toEqual({
      type: "bank_transaction",
      id: "t1",
    });
  });

  it("nhập và xuất kho cùng mở một loại phiếu kho", () => {
    expect(toOpenDocumentDetail("GOODS_RECEIPT", "g")?.type).toBe(
      "inventory_voucher",
    );
    expect(toOpenDocumentDetail("GOODS_ISSUE", "g")?.type).toBe(
      "inventory_voucher",
    );
  });

  it("loại không mở được thì trả null", () => {
    expect(toOpenDocumentDetail("JOURNAL_ENTRY", "j")).toBeNull();
  });
});
