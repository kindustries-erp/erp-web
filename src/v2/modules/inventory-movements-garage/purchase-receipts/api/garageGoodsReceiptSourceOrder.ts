import { GOODS_RECEIPT_DEFAULT_UNIT } from "@/v2/core/goods-receipts";
import type {
  GoodsReceiptFormLine,
  GoodsReceiptPrefill,
  GoodsReceiptSourceOrderLoader,
  GoodsReceiptSourceOrderOption,
} from "@/v2/core/goods-receipts";
import {
  createProcurementApi,
  type ProcurementOrderDetail,
  type ProcurementOrderRow,
} from "@/v2/core/procurement";

/** API đơn mua garage, dùng để đọc đơn nguồn khi lập phiếu nhập (không đi qua module đơn mua) */
const garageOrderSourceApi = createProcurementApi<
  ProcurementOrderRow,
  ProcurementOrderDetail
>("/api/v2/procurement-orders-garage");

const toNumber = (value: number | string | null | undefined): number =>
  Number(value ?? 0) || 0;

/**
 * Chuyển đơn mua đã phát hành thành dữ liệu điền sẵn: chỉ dòng hàng (GOODS) còn số lượng chưa nhận.
 * Lỗi nghiệp vụ ném khóa ngắn (notIssued, fullyReceived, noLines) để màn danh sách dịch khi hiển thị.
 */
export async function loadGarageReceiptPrefill(
  orderId: string,
): Promise<GoodsReceiptPrefill> {
  const order = await garageOrderSourceApi.get(orderId);
  if (order.status !== "ISSUED") throw new Error("notIssued");
  if (order.fulfillmentStatus === "FULL") throw new Error("fullyReceived");

  const lines: GoodsReceiptFormLine[] = order.lines
    .filter((line) => line.lineType === "GOODS")
    .map((line) => {
      const remaining = Math.max(
        0,
        toNumber(line.qtyOrdered) - toNumber(line.qtyFulfilled),
      );
      const unitCost = toNumber(line.unitPrice);
      return {
        sourceLineId: line.id,
        maxQty: remaining,
        itemCode: line.itemCode ?? "",
        itemName: line.itemName ?? "",
        unit: GOODS_RECEIPT_DEFAULT_UNIT,
        qtyReceived: String(remaining),
        unitCost: String(unitCost),
        amount: String(remaining * unitCost),
        notes: line.description ?? "",
      };
    })
    .filter((line) => Number(line.qtyReceived) > 0);

  if (lines.length === 0) throw new Error("noLines");

  return {
    sourceOrderId: order.id,
    sourceOrderNo: order.orderNo,
    sourceOrderTotal: toNumber(order.totalAmount),
    supplierId: order.supplierId ?? "",
    supplierName: order.supplierName ?? "",
    branchId: order.branchId ?? "",
    branchName: order.branchName ?? "",
    lines,
  };
}

/** Đơn mua đã phát hành và còn hàng chưa nhận, để chọn trên phiếu nhập (tìm trên server). */
export async function searchGarageReceiptOrders(
  term: string,
): Promise<GoodsReceiptSourceOrderOption[]> {
  const { items } = await garageOrderSourceApi.list({
    page: 1,
    pageSize: 50,
    sorts: [],
    columnFilters: {},
    columnSearch: {},
    columnOperators: {},
    dateRanges: {},
    search: term || undefined,
    status: "ISSUED",
  });
  return items
    .filter((order) => order.fulfillmentStatus !== "FULL")
    .map((order) => ({
      id: order.id,
      orderNo: order.orderNo,
      supplierName: order.supplierName ?? "",
      totalAmount: toNumber(order.totalAmount),
    }));
}

export const garageSourceOrderLoader: GoodsReceiptSourceOrderLoader = {
  load: loadGarageReceiptPrefill,
  search: searchGarageReceiptOrders,
};
