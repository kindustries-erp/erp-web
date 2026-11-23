import { describe, expect, it } from "vitest";
import { buildGoodsReceiptColumns } from "./GoodsReceiptTable.columns";
import { goodsReceiptViewVisibility } from "./GoodsReceiptTable.views";

const columns = buildGoodsReceiptColumns(
  (_key, fallback) => fallback ?? "",
  () => undefined,
);

describe("buildGoodsReceiptColumns", () => {
  it("leaves the row number to V2StandardTable", () => {
    expect(columns.map((column) => column.key)).not.toContain("index");
  });

  it("keeps every field as a column in the same order", () => {
    expect(columns.map((column) => column.key)).toEqual([
      "receiptNo",
      "receiptDate",
      "supplierName",
      "branchName",
      "totalAmount",
      "status",
      "remarks",
    ]);
  });
});

describe("goodsReceiptViewVisibility", () => {
  it("shows all columns in the all view", () => {
    expect(Object.values(goodsReceiptViewVisibility.all).every(Boolean)).toBe(
      true,
    );
  });
});
