import { describe, expect, it } from "vitest";
import { buildGarageGoodsReceiptsColumns } from "./GarageGoodsReceiptTable.columns";
import { garageGoodsReceiptsViewVisibility } from "./GarageGoodsReceiptTable.views";

const columns = buildGarageGoodsReceiptsColumns(
  (_key, fallback) => fallback ?? "",
  () => undefined,
);

describe("buildGarageGoodsReceiptsColumns", () => {
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

describe("garageGoodsReceiptsViewVisibility", () => {
  it("shows all columns in the all view", () => {
    expect(
      Object.values(garageGoodsReceiptsViewVisibility.all).every(Boolean),
    ).toBe(true);
  });
});
