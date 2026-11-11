import { todayIsoDate } from "../procurement.rules";
import type {
  ProcurementOrderDetail,
  ProcurementPoDraft,
  ProcurementRequestDetail,
} from "../procurement.types";
import { newProcurementLineKey } from "./procurementLine.form";
import {
  emptyProcurementLine,
  procurementLineFromDetail,
  toOrderLinePayload,
  validateProcurementLines,
  type ProcurementLineFormValue,
  type ProcurementLinesError,
} from "./procurementLine.form";

export interface ProcurementOrderFormValue {
  branchId: string;
  branchName: string;
  orderDate: string;
  expectedDate: string;
  supplierId: string | null;
  supplierName: string;
  remarks: string;
  supplierInvoiceNo: string;
  /** PR nguồn; null khi đơn lập trực tiếp */
  requestId: string | null;
  lines: ProcurementLineFormValue[];
}

export interface ProcurementOrderFormErrors {
  branchId?: true;
  orderDate?: true;
  lines?: ProcurementLinesError;
}

export const emptyOrderForm = (today: string): ProcurementOrderFormValue => ({
  branchId: "",
  branchName: "",
  orderDate: today,
  expectedDate: "",
  supplierId: null,
  supplierName: "",
  remarks: "",
  supplierInvoiceNo: "",
  requestId: null,
  lines: [emptyProcurementLine()],
});

export const validateOrderForm = (
  form: ProcurementOrderFormValue,
  branchOptional = false,
  itemCodeRequired = false,
): ProcurementOrderFormErrors => {
  const errors: ProcurementOrderFormErrors = {};
  if (!branchOptional && !form.branchId) errors.branchId = true;
  if (!form.orderDate) errors.orderDate = true;
  const linesError = validateProcurementLines(form.lines, itemCodeRequired);
  if (linesError) errors.lines = linesError;
  return errors;
};

export const hasOrderFormErrors = (errors: ProcurementOrderFormErrors) =>
  Object.keys(errors).length > 0;

const trimOrNull = (value: string): string | null => value.trim() || null;

/** Payload tạo đơn: chi nhánh (rỗng thì bỏ qua), ngày, NCC, PR nguồn và các dòng. */
export const toOrderCreatePayload = (form: ProcurementOrderFormValue) => ({
  branchId: form.branchId || undefined,
  branchName: form.branchName.trim() || undefined,
  orderDate: form.orderDate,
  expectedDate: form.expectedDate || undefined,
  supplierId: form.supplierId ?? undefined,
  supplierName: form.supplierName.trim() || undefined,
  supplierInvoiceNo: form.supplierInvoiceNo.trim() || undefined,
  requestId: form.requestId ?? undefined,
  remarks: form.remarks.trim() || undefined,
  lines: form.lines.map(toOrderLinePayload),
});

/**
 * Payload sửa đầu đơn (chỉ khi còn nháp); các trường rỗng gửi null để xóa giá trị cũ.
 * Chi nhánh chỉ gửi khi tùy chọn (Garage); luồng thường không gửi để giữ hành vi cũ.
 */
export const toOrderHeaderPayload = (
  form: ProcurementOrderFormValue,
  branchOptional = false,
) => ({
  ...(branchOptional
    ? {
        branchId: form.branchId || null,
        branchName: trimOrNull(form.branchName),
      }
    : {}),
  orderDate: form.orderDate,
  expectedDate: form.expectedDate || null,
  supplierId: form.supplierId,
  supplierName: trimOrNull(form.supplierName),
  remarks: trimOrNull(form.remarks),
  supplierInvoiceNo: trimOrNull(form.supplierInvoiceNo),
});

const dateOnly = (value: string | null | undefined): string =>
  value ? value.slice(0, 10) : "";

export const orderFormFromDetail = (
  detail: ProcurementOrderDetail,
): ProcurementOrderFormValue => ({
  branchId: detail.branchId ?? "",
  branchName: detail.branchName ?? "",
  orderDate: dateOnly(detail.orderDate),
  expectedDate: dateOnly(detail.expectedDate),
  supplierId: detail.supplierId,
  supplierName: detail.supplierName ?? "",
  remarks: detail.remarks ?? "",
  supplierInvoiceNo: detail.supplierInvoiceNo ?? "",
  requestId: detail.requestId,
  lines: detail.lines.length
    ? detail.lines.map(procurementLineFromDetail)
    : [emptyProcurementLine()],
});

/**
 * Form PO tạo từ PR: chi nhánh và đầu đề lấy từ PR; dòng lấy từ bản nháp (phần còn lại chưa đặt).
 * Đơn giá lấy từ đơn giá dự kiến của PR.
 */
export const orderFormFromRequestDraft = (
  request: ProcurementRequestDetail,
  draft: ProcurementPoDraft,
): ProcurementOrderFormValue => ({
  ...emptyOrderForm(todayIsoDate()),
  branchId: request.branchId ?? "",
  branchName: request.branchName ?? "",
  // Ngày dự kiến nhận = ngày cần hàng của đề nghị (vẫn sửa được)
  expectedDate: dateOnly(request.neededDate),
  requestId: request.id,
  remarks: "",
  lines: draft.lines.length
    ? draft.lines.map((l) => ({
        key: newProcurementLineKey(),
        lineType: l.lineType,
        itemCode: l.itemCode ?? "",
        itemName: l.itemName ?? "",
        description: l.description ?? "",
        qty: String(l.qtyRemaining),
        price: l.estUnitPrice === null ? "" : String(l.estUnitPrice),
        requestLineId: l.requestLineId,
      }))
    : [emptyProcurementLine()],
});
