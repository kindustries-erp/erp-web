import { describe, expect, it } from "vitest";
import {
  GoodsReceiptStatus,
  applyGoodsReceiptPrefill,
  clearGoodsReceiptSourceOrder,
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

describe("đơn mua nguồn của phiếu", () => {
  const prefill = {
    sourceOrderId: "po-1",
    sourceOrderNo: "GDMH-1",
    sourceOrderTotal: 950,
    supplierId: "sup-1",
    supplierName: "NCC A",
    branchId: "br-1",
    branchName: "Chi nhánh 1",
    lines: [
      {
        itemCode: "",
        itemName: "Lọc dầu",
        unit: "Cái",
        qtyReceived: "3",
        unitCost: "100",
        amount: "300",
        notes: "",
      },
    ],
  };

  it("điền sẵn đơn mua: số đơn, tổng đơn, NCC và tổng dòng nhận", () => {
    const form = applyGoodsReceiptPrefill(emptyGoodsReceiptForm(), prefill);
    expect(form).toMatchObject({
      sourceOrderId: "po-1",
      sourceOrderNo: "GDMH-1",
      sourceOrderTotal: "950",
      supplierName: "NCC A",
      totalAmount: "300",
    });
  });

  it("đọc số đơn và tổng đơn từ phiếu API", () => {
    const form = toGoodsReceiptForm({
      id: "r1",
      receiptNo: "GGR-1",
      receiptDate: "2026-11-04",
      sourceOrderId: "po-1",
      sourceOrderNo: "GDMH-1",
      sourceOrderTotal: 950,
    });
    expect(form.sourceOrderNo).toBe("GDMH-1");
    expect(form.sourceOrderTotal).toBe("950");
  });

  it("bỏ đơn mua thì xóa NCC, chi nhánh, tổng và dòng", () => {
    const filled = applyGoodsReceiptPrefill(emptyGoodsReceiptForm(), prefill);
    const cleared = clearGoodsReceiptSourceOrder(filled);
    expect(cleared).toMatchObject({
      sourceOrderId: "",
      sourceOrderNo: "",
      supplierName: "",
      branchName: "",
      totalAmount: "0",
      lines: [],
    });
  });
});
