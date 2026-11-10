import { describe, expect, it } from "vitest";
import {
  GoodsReceiptStatus,
  emptyGoodsReceiptForm,
  toGoodsReceiptForm,
} from "./goodsReceipt";

describe("toGoodsReceiptForm", () => {
  it("chuyển chi tiết API sang form, cắt ngày và gán đơn vị mặc định", () => {
    const form = toGoodsReceiptForm({
      id: "r1",
      receiptNo: "GGR-20261104-001",
      receiptDate: "2026-11-04T00:00:00.000Z",
      totalAmount: 1000000,
      status: "DRAFT",
      lines: [
        {
          id: "l1",
          itemName: "Má phanh",
          qtyReceived: 2,
          unitCost: 500000,
          amount: 1000000,
        },
      ],
    });

    expect(form.receiptDate).toBe("2026-11-04");
    expect(form.totalAmount).toBe("1000000");
    expect(form.lines[0]).toMatchObject({
      id: "l1",
      unit: "Cái",
      qtyReceived: "2",
      unitCost: "500000",
    });
  });

  it("phiếu thiếu trạng thái được coi là nháp", () => {
    const form = toGoodsReceiptForm({
      id: "r2",
      receiptNo: "X",
      receiptDate: "2026-11-01",
      status: null,
      lines: [],
    });
    expect(form.status).toBe(GoodsReceiptStatus.DRAFT);
  });
});

describe("emptyGoodsReceiptForm", () => {
  it("form mới bắt đầu ở trạng thái nháp và không có dòng", () => {
    const form = emptyGoodsReceiptForm();
    expect(form.status).toBe(GoodsReceiptStatus.DRAFT);
    expect(form.lines).toEqual([]);
  });
});
