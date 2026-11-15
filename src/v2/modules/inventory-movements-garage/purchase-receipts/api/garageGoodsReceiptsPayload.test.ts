import { describe, expect, it } from "vitest";
import { toGarageGoodsReceiptPayload } from "./garageGoodsReceiptsApi";
import type { GarageGoodsReceiptFormValue } from "@/v2/modules/inventory-movements-garage/purchase-receipts/domain/entities/garageGoodsReceipt";

const baseForm = {
  receiptNo: "GR-1",
  receiptDate: "2026-11-06",
  supplierId: "",
  supplierName: "",
  branchId: "",
  branchName: "",
  totalAmount: "",
  status: "DRAFT",
  paymentStatus: "UNPAID",
  remarks: "",
  lines: [],
} as unknown as GarageGoodsReceiptFormValue;

describe("toGarageGoodsReceiptPayload - chi nhánh tùy chọn", () => {
  it("gửi null khi bỏ trống chi nhánh để cập nhật xóa được giá trị cũ", () => {
    const payload = toGarageGoodsReceiptPayload(baseForm);
    expect(payload.branchId).toBeNull();
    expect(payload.branchName).toBeNull();
  });

  it("gửi đúng id và tên khi đã chọn chi nhánh", () => {
    const payload = toGarageGoodsReceiptPayload({
      ...baseForm,
      branchId: "6d37f290-b465-4af1-91b6-265ced4b30bb",
      branchName: "CN1 — Chi nhánh 1",
    });
    expect(payload.branchId).toBe("6d37f290-b465-4af1-91b6-265ced4b30bb");
    expect(payload.branchName).toBe("CN1 — Chi nhánh 1");
  });
});
