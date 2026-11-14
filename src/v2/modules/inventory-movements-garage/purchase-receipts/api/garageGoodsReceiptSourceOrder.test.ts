import { beforeEach, describe, expect, it, vi } from "vitest";

const { getOrder, listOrders } = vi.hoisted(() => ({
  getOrder: vi.fn(),
  listOrders: vi.fn(),
}));

vi.mock("@/v2/core/procurement", () => ({
  createProcurementApi: () => ({ get: getOrder, list: listOrders }),
}));

import {
  loadGarageReceiptPrefill,
  searchGarageReceiptOrders,
} from "./garageGoodsReceiptSourceOrder";

const baseOrder = {
  id: "po-1",
  orderNo: "GDMH-1",
  totalAmount: "950",
  status: "ISSUED",
  fulfillmentStatus: "PARTIAL",
  supplierId: "sup-1",
  supplierName: "NCC A",
  branchId: "br-1",
  branchName: "Chi nhánh 1",
  lines: [
    {
      id: "line-1",
      lineType: "GOODS",
      itemCode: "LOC",
      itemName: "Lọc dầu",
      description: "Hàng chính hãng",
      qtyOrdered: 5,
      qtyFulfilled: 2,
      unitPrice: 100,
    },
    {
      id: "line-2",
      lineType: "GOODS",
      itemCode: "DAU",
      itemName: "Dầu máy",
      qtyOrdered: 3,
      qtyFulfilled: 3,
      unitPrice: 50,
    },
    {
      id: "line-3",
      lineType: "SERVICE",
      itemName: "Công thay dầu",
      qtyOrdered: 1,
      qtyFulfilled: 0,
      unitPrice: 200,
    },
  ],
};

describe("loadGarageReceiptPrefill", () => {
  beforeEach(() => {
    getOrder.mockReset();
  });

  it("điền các dòng hàng còn thiếu, bỏ dòng đã nhận đủ và dòng dịch vụ", async () => {
    getOrder.mockResolvedValue(baseOrder);
    const prefill = await loadGarageReceiptPrefill("po-1");

    expect(prefill.sourceOrderId).toBe("po-1");
    expect(prefill.sourceOrderNo).toBe("GDMH-1");
    expect(prefill.sourceOrderTotal).toBe(950);
    expect(prefill.supplierId).toBe("sup-1");
    expect(prefill.branchName).toBe("Chi nhánh 1");
    expect(prefill.lines).toHaveLength(1);
    expect(prefill.lines[0]).toMatchObject({
      sourceLineId: "line-1",
      itemName: "Lọc dầu",
      qtyReceived: "3",
      maxQty: 3,
      unitCost: "100",
      amount: "300",
      unit: "Cái",
    });
  });

  it("từ chối đơn chưa phát hành", async () => {
    getOrder.mockResolvedValue({ ...baseOrder, status: "APPROVED" });
    await expect(loadGarageReceiptPrefill("po-1")).rejects.toThrow("notIssued");
  });

  it("từ chối đơn đã nhận đủ", async () => {
    getOrder.mockResolvedValue({ ...baseOrder, fulfillmentStatus: "FULL" });
    await expect(loadGarageReceiptPrefill("po-1")).rejects.toThrow(
      "fullyReceived",
    );
  });

  it("báo khi không còn dòng hàng nào để nhập", async () => {
    getOrder.mockResolvedValue({
      ...baseOrder,
      lines: [baseOrder.lines[1]],
    });
    await expect(loadGarageReceiptPrefill("po-1")).rejects.toThrow("noLines");
  });
});

describe("searchGarageReceiptOrders", () => {
  beforeEach(() => {
    listOrders.mockReset();
  });

  it("chỉ tìm đơn đã phát hành và bỏ đơn đã nhận đủ", async () => {
    listOrders.mockResolvedValue({
      items: [
        {
          id: "po-1",
          orderNo: "GDMH-1",
          supplierName: "NCC A",
          totalAmount: "100",
          fulfillmentStatus: "PARTIAL",
        },
        {
          id: "po-2",
          orderNo: "GDMH-2",
          supplierName: null,
          totalAmount: "50",
          fulfillmentStatus: "FULL",
        },
      ],
    });

    const options = await searchGarageReceiptOrders("GDMH");

    expect(listOrders).toHaveBeenCalledWith(
      expect.objectContaining({ status: "ISSUED", search: "GDMH" }),
    );
    expect(options).toEqual([
      {
        id: "po-1",
        orderNo: "GDMH-1",
        supplierName: "NCC A",
        totalAmount: 100,
      },
    ]);
  });
});
