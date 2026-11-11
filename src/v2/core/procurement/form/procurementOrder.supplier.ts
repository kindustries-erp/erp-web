import type { ProcurementOrderFormValue } from "./procurementOrder.form";

/** Giá trị cần ghi cho một thay đổi NCC/hóa đơn (chỉ các trường trong patch được ghi). */
export type ProcurementOrderSupplierPatch = Partial<
  Pick<
    ProcurementOrderFormValue,
    "supplierId" | "supplierName" | "supplierInvoiceNo"
  >
>;

/** NCC đã có tên hoặc mã: đủ điều kiện gửi duyệt khi NCC là ô nhập tự do (Garage). */
export const hasOrderSupplier = (form: ProcurementOrderFormValue): boolean =>
  Boolean(form.supplierId || form.supplierName.trim());

/**
 * Gõ tên NCC. Nếu tên đổi so với giá trị hiện tại thì NCC thành dữ liệu tự nhập
 * (bỏ mã danh mục) và hóa đơn được reset, vì hóa đơn thuộc về NCC trước đó.
 */
export const applyTypedSupplier = (
  form: ProcurementOrderFormValue,
  typedName: string,
): ProcurementOrderSupplierPatch => {
  if (typedName.trim() === form.supplierName.trim()) {
    return { supplierName: typedName };
  }
  return {
    supplierName: typedName,
    supplierId: null,
    supplierInvoiceNo: "",
  };
};

/** Chọn hóa đơn: số hóa đơn và NCC theo người bán. Mã NCC sẽ được tra theo MST sau đó. */
export const applyInvoiceSelection = (
  invoiceNo: string,
  sellerName: string,
) => ({
  supplierInvoiceNo: invoiceNo,
  supplierId: null,
  supplierName: sellerName,
});

/** Bỏ hóa đơn: chỉ xóa số hóa đơn, giữ nguyên NCC đang có. */
export const applyInvoiceCleared = (): ProcurementOrderSupplierPatch => ({
  supplierInvoiceNo: "",
});
