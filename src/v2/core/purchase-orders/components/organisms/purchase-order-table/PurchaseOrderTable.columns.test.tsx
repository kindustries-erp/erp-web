import { describe, expect, it, vi } from "vitest";
import { buildPurchaseOrderColumns } from "./PurchaseOrderTable.columns";
import { purchaseOrderViewVisibility } from "./PurchaseOrderTable.views";

const t = (_key: string, fallback?: string) => fallback ?? "";

describe("buildPurchaseOrderColumns", () => {
  it("khai báo đủ cột theo whitelist và không khai báo STT", () => {
    const keys = buildPurchaseOrderColumns(t, vi.fn()).map((c) => c.key);
    expect(keys).toEqual([
      "poNo",
      "orderDate",
      "expectedDate",
      "supplierName",
      "branchName",
      "totalAmount",
      "status",
      "paymentStatus",
      "inventoryStatus",
      "supplierInvoiceNo",
      "remarks",
      "createdAt",
    ]);
    expect(keys).not.toContain("__index");
  });

  it("chế độ xem tổng quan ẩn các cột phụ, chế độ tất cả hiện đủ", () => {
    const keys = buildPurchaseOrderColumns(t, vi.fn()).map((c) => c.key);
    for (const key of keys) {
      expect(key in purchaseOrderViewVisibility.all).toBe(true);
      expect(key in purchaseOrderViewVisibility.overview).toBe(true);
    }
    expect(purchaseOrderViewVisibility.overview.remarks).toBe(false);
    expect(purchaseOrderViewVisibility.all.remarks).toBe(true);
  });

  it("cột nhập kho chỉ hiển thị, không có bộ lọc", () => {
    const columns = buildPurchaseOrderColumns(t, vi.fn());
    const inventory = columns.find((c) => c.key === "inventoryStatus");
    expect(inventory?.filter).toBeUndefined();
  });
});
