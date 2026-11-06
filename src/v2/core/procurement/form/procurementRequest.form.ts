import type { ProcurementRequestDetail } from "../procurement.types";
import {
  emptyProcurementLine,
  procurementLineFromDetail,
  toRequestLinePayload,
  validateProcurementLines,
  type ProcurementLineFormValue,
  type ProcurementLinesError,
} from "./procurementLine.form";

export interface ProcurementRequestFormValue {
  branchId: string;
  branchName: string;
  requestDate: string;
  neededDate: string;
  title: string;
  remarks: string;
  lines: ProcurementLineFormValue[];
}

export interface ProcurementRequestFormErrors {
  branchId?: true;
  requestDate?: true;
  lines?: ProcurementLinesError;
}

export const emptyRequestForm = (
  today: string,
): ProcurementRequestFormValue => ({
  branchId: "",
  branchName: "",
  requestDate: today,
  neededDate: "",
  title: "",
  remarks: "",
  lines: [emptyProcurementLine()],
});

export const validateRequestForm = (
  form: ProcurementRequestFormValue,
  branchOptional = false,
): ProcurementRequestFormErrors => {
  const errors: ProcurementRequestFormErrors = {};
  if (!branchOptional && !form.branchId) errors.branchId = true;
  if (!form.requestDate) errors.requestDate = true;
  const linesError = validateProcurementLines(form.lines);
  if (linesError) errors.lines = linesError;
  return errors;
};

export const hasRequestFormErrors = (errors: ProcurementRequestFormErrors) =>
  Object.keys(errors).length > 0;

/** Chi nhánh rỗng gửi undefined (tạo) để API không nhận chuỗi rỗng khi là UUID. */
export const toRequestCreatePayload = (form: ProcurementRequestFormValue) => ({
  branchId: form.branchId || undefined,
  branchName: form.branchName.trim() || undefined,
  requestDate: form.requestDate,
  neededDate: form.neededDate || undefined,
  title: form.title.trim() || undefined,
  remarks: form.remarks.trim() || undefined,
  lines: form.lines.map(toRequestLinePayload),
});

/**
 * Payload sửa đầu đề khi còn nháp. Trường rỗng gửi null.
 * Chi nhánh chỉ gửi khi tùy chọn (Garage); luồng thường không gửi để giữ hành vi cũ.
 */
export const toRequestHeaderPayload = (
  form: ProcurementRequestFormValue,
  branchOptional = false,
) => ({
  ...(branchOptional
    ? {
        branchId: form.branchId || null,
        branchName: form.branchName.trim() || null,
      }
    : {}),
  requestDate: form.requestDate,
  neededDate: form.neededDate || null,
  title: form.title.trim() || null,
  remarks: form.remarks.trim() || null,
});

/** Đề nghị chỉ thay được dòng khi còn nháp; đầu đề không sửa được sau khi tạo. */
export const toRequestLinesPayload = (form: ProcurementRequestFormValue) =>
  form.lines.map(toRequestLinePayload);

const dateOnly = (value: string | null | undefined): string =>
  value ? value.slice(0, 10) : "";

export const requestFormFromDetail = (
  detail: ProcurementRequestDetail,
): ProcurementRequestFormValue => ({
  branchId: detail.branchId ?? "",
  branchName: detail.branchName ?? "",
  requestDate: dateOnly(detail.requestDate),
  neededDate: dateOnly(detail.neededDate),
  title: detail.title ?? "",
  remarks: detail.remarks ?? "",
  lines: detail.lines.length
    ? detail.lines.map(procurementLineFromDetail)
    : [emptyProcurementLine()],
});
