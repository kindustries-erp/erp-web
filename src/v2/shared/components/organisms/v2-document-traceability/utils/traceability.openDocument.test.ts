import { afterEach, describe, expect, it, vi } from "vitest";
import {
  OPEN_ERP_DOCUMENT_EVENT,
  openErpDocument,
  toOpenDocumentDetail,
} from "./traceability.openDocument";

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

  it("phủ các loại còn lại có màn hình mở", () => {
    expect(toOpenDocumentDetail("PURCHASE_ORDER", "p")?.type).toBe(
      "erp_purchase_order",
    );
    expect(toOpenDocumentDetail("SALES_ORDER", "s")?.type).toBe(
      "erp_sales_order",
    );
    expect(toOpenDocumentDetail("GARAGE_CASE", "c")?.type).toBe("garage_case");
    expect(toOpenDocumentDetail("INVENTORY_ITEM", "i")?.type).toBe(
      "inventory_item",
    );
    expect(toOpenDocumentDetail("PRODUCTION_ORDER", "o")?.type).toBe(
      "production_order",
    );
    expect(toOpenDocumentDetail("BOM", "b")?.type).toBe("bom");
  });

  it("loại không mở được thì trả null", () => {
    expect(toOpenDocumentDetail("JOURNAL_ENTRY", "j")).toBeNull();
  });
});

describe("openErpDocument", () => {
  afterEach(() => vi.restoreAllMocks());

  it("phát sự kiện toàn cục với đúng loại và id", () => {
    const handler = vi.fn();
    window.addEventListener(OPEN_ERP_DOCUMENT_EVENT, handler);
    const opened = openErpDocument("INVOICE", "i1");
    window.removeEventListener(OPEN_ERP_DOCUMENT_EVENT, handler);

    expect(opened).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({
      type: "erp_invoice",
      id: "i1",
    });
  });

  it("không phát sự kiện khi loại chứng từ không mở được", () => {
    const handler = vi.fn();
    window.addEventListener(OPEN_ERP_DOCUMENT_EVENT, handler);
    const opened = openErpDocument("JOURNAL_ENTRY", "j1");
    window.removeEventListener(OPEN_ERP_DOCUMENT_EVENT, handler);

    expect(opened).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });
});
