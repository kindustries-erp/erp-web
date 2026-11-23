import { describe, expect, it } from "vitest";
import { PurchaseOrderStatus } from "./purchaseOrderConstants";
import type { PurchaseOrderFormValue } from "./purchaseOrder";
import { emptyPurchaseOrderForm } from "./purchaseOrder";
import {
  calcPurchaseOrderLineAmount,
  canApprovePurchaseOrder,
  canCancelPurchaseOrder,
  canConfirmPurchaseOrder,
  canDeletePurchaseOrder,
  canEditPurchaseOrder,
  isPurchaseOrderFormDirty,
  sumPurchaseOrderLineAmounts,
  validatePurchaseOrderForm,
} from "./purchaseOrderRules";

const S = PurchaseOrderStatus;

describe("tính tiền dòng", () => {
  it("nhân số lượng với đơn giá và coi giá trị lỗi là 0", () => {
    expect(calcPurchaseOrderLineAmount("3", "1000")).toBe(3000);
    expect(calcPurchaseOrderLineAmount("abc", "1000")).toBe(0);
    expect(calcPurchaseOrderLineAmount("2", "")).toBe(0);
  });

  it("cộng thành tiền của nhiều dòng", () => {
    expect(
      sumPurchaseOrderLineAmounts([
        { qtyOrdered: "2", unitPrice: "100" },
        { qtyOrdered: "1", unitPrice: "50" },
      ]),
    ).toBe(250);
  });
});

describe("validate form", () => {
  it("trả về trường bắt buộc trống đầu tiên", () => {
    const form: PurchaseOrderFormValue = {
      ...emptyPurchaseOrderForm(),
      orderDate: "",
    };
    expect(validatePurchaseOrderForm(form, ["orderDate"])).toBe("orderDate");
  });

  it("trả về null khi đủ trường bắt buộc", () => {
    const form = emptyPurchaseOrderForm();
    expect(validatePurchaseOrderForm(form, ["orderDate"])).toBeNull();
  });

  it("coi chuỗi toàn khoảng trắng là trống", () => {
    const form = { ...emptyPurchaseOrderForm(), supplierName: "   " };
    expect(validatePurchaseOrderForm(form, ["supplierName"])).toBe(
      "supplierName",
    );
  });
});

describe("dirty form", () => {
  it("phát hiện thay đổi so với giá trị ban đầu", () => {
    const initial = emptyPurchaseOrderForm();
    expect(isPurchaseOrderFormDirty(initial, initial)).toBe(false);
    expect(
      isPurchaseOrderFormDirty({ ...initial, remarks: "ghi chú" }, initial),
    ).toBe(true);
  });
});

describe("quyền hành động theo trạng thái", () => {
  it("sửa: mở ở DRAFT, APPROVED, CONFIRMED, PARTIAL_RECEIVED; khóa ở RECEIVED, CANCELLED", () => {
    expect(canEditPurchaseOrder(S.DRAFT)).toBe(true);
    expect(canEditPurchaseOrder(S.APPROVED)).toBe(true);
    expect(canEditPurchaseOrder(S.CONFIRMED)).toBe(true);
    expect(canEditPurchaseOrder(S.PARTIAL_RECEIVED)).toBe(true);
    expect(canEditPurchaseOrder(S.RECEIVED)).toBe(false);
    expect(canEditPurchaseOrder(S.CANCELLED)).toBe(false);
  });

  it("duyệt: chỉ ở DRAFT", () => {
    expect(canApprovePurchaseOrder(S.DRAFT)).toBe(true);
    expect(canApprovePurchaseOrder(S.APPROVED)).toBe(false);
  });

  it("xác nhận: ở DRAFT và APPROVED", () => {
    expect(canConfirmPurchaseOrder(S.DRAFT)).toBe(true);
    expect(canConfirmPurchaseOrder(S.APPROVED)).toBe(true);
    expect(canConfirmPurchaseOrder(S.CONFIRMED)).toBe(false);
  });

  it("hủy: ở APPROVED, CONFIRMED, PARTIAL_RECEIVED", () => {
    expect(canCancelPurchaseOrder(S.APPROVED)).toBe(true);
    expect(canCancelPurchaseOrder(S.CONFIRMED)).toBe(true);
    expect(canCancelPurchaseOrder(S.PARTIAL_RECEIVED)).toBe(true);
    expect(canCancelPurchaseOrder(S.DRAFT)).toBe(false);
    expect(canCancelPurchaseOrder(S.RECEIVED)).toBe(false);
  });

  it("xóa: chỉ ở DRAFT", () => {
    expect(canDeletePurchaseOrder(S.DRAFT)).toBe(true);
    expect(canDeletePurchaseOrder(S.APPROVED)).toBe(false);
  });
});
