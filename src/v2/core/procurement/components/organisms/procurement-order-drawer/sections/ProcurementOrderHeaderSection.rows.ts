import type { DrawerRowConfig } from "@/v2/shared/components";
import {
  GARAGE_ORDER_VIEW_KEYS,
  orderByKeys,
  placeBranchAfter,
} from "../../../../procurement.branch";
import type { ProcurementOrderFormValue } from "../../../../form/procurementOrder.form";

type Translate = (key: string, fallback: string) => string;

/** Hàng đọc của đầu đơn (chế độ xem). Đơn Garage sắp theo `GARAGE_ORDER_VIEW_KEYS`. */
export function buildOrderViewRows(
  form: ProcurementOrderFormValue,
  t: Translate,
  requestLabel: string,
  branchOptional: boolean,
): DrawerRowConfig[] {
  const rows: DrawerRowConfig[] = [
    ...(form.requestId
      ? [
          {
            key: "request",
            label: t("v2.procurement.fields.request", "Từ đề nghị mua"),
            value: requestLabel || form.requestId,
          },
        ]
      : []),
    {
      key: "branch",
      label: t("v2.procurement.fields.branch", "Chi nhánh"),
      value: form.branchName || "—",
    },
    {
      key: "orderDate",
      label: t("v2.procurement.fields.orderDate", "Ngày đơn"),
      value: form.orderDate || "—",
    },
    {
      key: "expectedDate",
      label: t("v2.procurement.fields.expectedDate", "Ngày dự kiến nhận"),
      value: form.expectedDate || "—",
    },
    {
      key: "supplier",
      label: t("v2.procurement.fields.supplier", "Nhà cung cấp"),
      value: form.supplierName || "—",
    },
    {
      key: "supplierInvoiceNo",
      label: t("v2.procurement.fields.supplierInvoiceNo", "Số hóa đơn NCC"),
      value: form.supplierInvoiceNo || "—",
      copyable: Boolean(form.supplierInvoiceNo),
    },
    {
      key: "remarks",
      label: t("v2.procurement.fields.remarks", "Ghi chú"),
      value: form.remarks || "—",
      multiline: true,
    },
  ];
  return branchOptional
    ? orderByKeys(rows, GARAGE_ORDER_VIEW_KEYS)
    : placeBranchAfter(rows, ["branch"], "expectedDate", false);
}
