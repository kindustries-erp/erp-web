import { describe, expect, it } from "vitest";
import {
  ErpResource,
  PERMISSION_RESOURCE_GROUPS,
  RBAC_COLLECTIONS,
} from "../rbac";

describe("RBAC Configuration & Resource Collections", () => {
  it("contains garage_goods_receipts in RBAC_COLLECTIONS", () => {
    const item = RBAC_COLLECTIONS.find(
      (c) => c.collection === "garage_goods_receipts",
    );
    expect(item).toBeDefined();
    expect(item?.group).toBe("Garage & Xưởng dịch vụ");
    expect(item?.label).toBe("Phiếu nhập kho Garage");
  });

  it("contains garage_purchase_orders in RBAC_COLLECTIONS and garage group", () => {
    const item = RBAC_COLLECTIONS.find(
      (c) => c.collection === "garage_purchase_orders",
    );
    expect(item?.label).toBe("Đơn mua hàng Garage");
    const garageGroup = PERMISSION_RESOURCE_GROUPS.find(
      (g) => g.groupKey === "garage",
    );
    expect(garageGroup?.resources).toContain(
      ErpResource.GARAGE_PURCHASE_ORDERS,
    );
  });

  it("contains GARAGE_GOODS_RECEIPTS in PERMISSION_RESOURCE_GROUPS garage group", () => {
    const garageGroup = PERMISSION_RESOURCE_GROUPS.find(
      (g) => g.groupKey === "garage",
    );
    expect(garageGroup).toBeDefined();
    expect(garageGroup?.resources).toContain(ErpResource.GARAGE_GOODS_RECEIPTS);
  });

  it("ensures all collections have collection, label, and group defined", () => {
    for (const c of RBAC_COLLECTIONS) {
      expect(c.collection).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(c.group).toBeTruthy();
    }
  });
});
