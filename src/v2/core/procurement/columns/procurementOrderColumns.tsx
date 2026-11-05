import * as React from "react";
import { headerFilter } from "@/v2/shared/components/organisms/v2-standard-table/utils/v2HeaderFilterBuilder";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table/V2StandardTable.type";
import { ProcurementStatusBadge } from "../components/molecules/procurement-status-badge";
import type { ProcurementOrderRow } from "../procurement.types";

type T = (key: string, fallback: string) => string;

const formatMoney = (value: string | number | null | undefined) =>
  value == null || value === ""
    ? "—"
    : Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 0 });

const formatDate = (value: string | null | undefined) =>
  value ? value.slice(0, 10) : "—";

/** Cột bảng đơn mua hàng (PO) garage. */
export function buildProcurementOrderColumns(
  t: T,
): V2Column<ProcurementOrderRow>[] {
  return [
    {
      key: "orderNo",
      ...headerFilter(t("v2.procurement.columns.orderNo", "Số đơn")),
      size: 150,
      cell: (row) => <span className="font-medium">{row.orderNo}</span>,
    },
    {
      key: "supplierName",
      ...headerFilter(t("v2.procurement.columns.supplier", "Nhà cung cấp")),
      size: 220,
      cell: (row) => row.supplierName ?? "—",
    },
    {
      key: "branchName",
      ...headerFilter(t("v2.procurement.columns.branch", "Chi nhánh")),
      size: 140,
      cell: (row) => row.branchName ?? "—",
    },
    {
      key: "orderDate",
      ...headerFilter.date(t("v2.procurement.columns.orderDate", "Ngày đơn")),
      size: 120,
      cell: (row) => formatDate(row.orderDate),
    },
    {
      key: "totalAmount",
      ...headerFilter.amount(t("v2.procurement.columns.total", "Tổng tiền")),
      size: 140,
      align: TableColumnAlign.RIGHT,
      cell: (row) => formatMoney(row.totalAmount),
    },
    {
      key: "status",
      label: t("v2.procurement.columns.status", "Trạng thái"),
      size: 140,
      align: TableColumnAlign.CENTER,
      cell: (row) => <ProcurementStatusBadge value={row.status} t={t} />,
    },
    {
      key: "fulfillmentStatus",
      label: t("v2.procurement.columns.fulfillment", "Nhận hàng"),
      size: 140,
      align: TableColumnAlign.CENTER,
      cell: (row) => (
        <ProcurementStatusBadge value={row.fulfillmentStatus} t={t} />
      ),
    },
    {
      key: "paymentStatus",
      label: t("v2.procurement.columns.payment", "Thanh toán"),
      size: 120,
      cell: (row) => row.paymentStatus,
    },
    {
      key: "supplierInvoiceNo",
      ...headerFilter(t("v2.procurement.columns.invoiceNo", "Số hóa đơn NCC")),
      size: 160,
      cell: (row) => row.supplierInvoiceNo ?? "—",
    },
    {
      key: "createdBy",
      ...headerFilter(t("v2.procurement.columns.createdBy", "Người tạo")),
      size: 140,
      cell: (row) => row.createdBy ?? "—",
    },
  ];
}
