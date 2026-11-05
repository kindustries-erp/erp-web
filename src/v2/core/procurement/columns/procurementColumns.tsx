import * as React from "react";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table/V2StandardTable.type";
import type {
  ProcurementOrderRow,
  ProcurementRequestRow,
} from "../procurement.types";

type T = (key: string, fallback: string) => string;

/** Nhãn trạng thái dùng chung cho PR và PO; giá trị lạ hiển thị nguyên văn. */
export function ProcurementStatusText({ value, t }: { value: string; t: T }) {
  return (
    <span className="text-sm">
      {t(`v2.procurement.status.${value}`, value)}
    </span>
  );
}

const formatMoney = (value: string | null | undefined) =>
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
      label: t("v2.procurement.columns.orderNo", "Số đơn"),
      size: 150,
      cell: (row) => <span className="font-medium">{row.orderNo}</span>,
    },
    {
      key: "supplierName",
      label: t("v2.procurement.columns.supplier", "Nhà cung cấp"),
      size: 220,
      cell: (row) => row.supplierName ?? "—",
    },
    {
      key: "branchName",
      label: t("v2.procurement.columns.branch", "Chi nhánh"),
      size: 140,
      cell: (row) => row.branchName ?? "—",
    },
    {
      key: "orderDate",
      label: t("v2.procurement.columns.orderDate", "Ngày đơn"),
      size: 120,
      cell: (row) => formatDate(row.orderDate),
    },
    {
      key: "totalAmount",
      label: t("v2.procurement.columns.total", "Tổng tiền"),
      size: 140,
      align: TableColumnAlign.RIGHT,
      cell: (row) => formatMoney(row.totalAmount),
    },
    {
      key: "status",
      label: t("v2.procurement.columns.status", "Trạng thái"),
      size: 140,
      cell: (row) => <ProcurementStatusText value={row.status} t={t} />,
    },
    {
      key: "fulfillmentStatus",
      label: t("v2.procurement.columns.fulfillment", "Nhận hàng"),
      size: 140,
      cell: (row) => (
        <ProcurementStatusText value={row.fulfillmentStatus} t={t} />
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
      label: t("v2.procurement.columns.invoiceNo", "Số hóa đơn NCC"),
      size: 160,
      cell: (row) => row.supplierInvoiceNo ?? "—",
    },
    {
      key: "createdBy",
      label: t("v2.procurement.columns.createdBy", "Người tạo"),
      size: 140,
      cell: (row) => row.createdBy ?? "—",
    },
  ];
}

/** Cột bảng đề nghị mua hàng (PR) garage. */
export function buildProcurementRequestColumns(
  t: T,
): V2Column<ProcurementRequestRow>[] {
  return [
    {
      key: "requestNo",
      label: t("v2.procurement.columns.requestNo", "Số đề nghị"),
      size: 150,
      cell: (row) => <span className="font-medium">{row.requestNo}</span>,
    },
    {
      key: "title",
      label: t("v2.procurement.columns.title", "Nội dung"),
      size: 240,
      cell: (row) => row.title ?? "—",
    },
    {
      key: "branchName",
      label: t("v2.procurement.columns.branch", "Chi nhánh"),
      size: 140,
      cell: (row) => row.branchName ?? "—",
    },
    {
      key: "status",
      label: t("v2.procurement.columns.status", "Trạng thái"),
      size: 140,
      cell: (row) => <ProcurementStatusText value={row.status} t={t} />,
    },
    {
      key: "orderingStatus",
      label: t("v2.procurement.columns.ordering", "Tiến độ đặt"),
      size: 140,
      cell: (row) => <ProcurementStatusText value={row.orderingStatus} t={t} />,
    },
    {
      key: "createdBy",
      label: t("v2.procurement.columns.createdBy", "Người tạo"),
      size: 140,
      cell: (row) => row.createdBy ?? "—",
    },
  ];
}
