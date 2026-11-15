import { describe, expect, it } from "vitest";
import {
  emptyOrderForm,
  type ProcurementOrderFormValue,
} from "./procurementOrder.form";
import {
  applyInvoiceCleared,
  applyInvoiceSelection,
  applyTypedSupplier,
  hasOrderSupplier,
} from "./procurementOrder.supplier";

const base = (over: Partial<ProcurementOrderFormValue> = {}) => ({
  ...emptyOrderForm("2026-11-11"),
  supplierId: "s-1",
  supplierName: "NCC A",
  supplierInvoiceNo: "HD-1",
  ...over,
});

describe("applyTypedSupplier", () => {
  it("đổi tên NCC thì bỏ mã NCC cũ và reset hóa đơn", () => {
    expect(applyTypedSupplier(base(), "NCC B")).toEqual({
      supplierName: "NCC B",
      supplierId: null,
      supplierInvoiceNo: "",
    });
  });

  it("giữ nguyên tên thì không reset hóa đơn", () => {
    expect(applyTypedSupplier(base(), "NCC A ")).toEqual({
      supplierName: "NCC A ",
    });
  });
});

describe("applyInvoiceSelection / applyInvoiceCleared", () => {
  it("chọn hóa đơn đặt số hóa đơn và tên người bán, chờ tra mã NCC", () => {
    expect(applyInvoiceSelection("HD-9", "NCC Lốp")).toEqual({
      supplierInvoiceNo: "HD-9",
      supplierId: null,
      supplierName: "NCC Lốp",
    });
  });

  it("bỏ hóa đơn chỉ xóa số hóa đơn", () => {
    expect(applyInvoiceCleared()).toEqual({ supplierInvoiceNo: "" });
  });
});

describe("hasOrderSupplier", () => {
  it("có mã hoặc tên NCC đều đạt, chỉ khoảng trắng thì không đạt", () => {
    expect(hasOrderSupplier(base())).toBe(true);
    expect(
      hasOrderSupplier(base({ supplierId: null, supplierName: "x" })),
    ).toBe(true);
    expect(
      hasOrderSupplier(base({ supplierId: null, supplierName: "   " })),
    ).toBe(false);
  });
});
