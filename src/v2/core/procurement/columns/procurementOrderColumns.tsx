import * as React from "react";
import { V2TableText } from "@/v2/shared/components/molecules/v2-table-text";
import { headerFilter } from "@/v2/shared/components/organisms/v2-standard-table/utils/v2HeaderFilterBuilder";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table/V2StandardTable.type";
import { ProcurementStatusBadge } from "../components/molecules/procurement-status-badge";
import { ProcurementLinkedDocCell } from "../components/molecules/procurement-linked-doc-cell";
import type { ProcurementOrderRow } from "../procurement.types";
import {
  getOrderFulfillmentOptions,
  getOrderStatusOptions,
  getPaymentStatusOptions,
} from "./procurementStatusOptions";

type T = (key: string, fallback: string) => string;

const formatMoney = (value: string | number | null | undefined) =>
  value == null || value === ""
    ? "—"
    : Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 0 });

const formatDate = (value: string | null | undefined) =>
  value ? value.slice(0, 10) : "—";

/**
 * Cột bảng đơn mua hàng (PO) garage chuẩn V2 table.
 * `openLinked` mở đề nghị nguồn (drawer PR) ngay trên trang.
 */
export function buildProcurementOrderColumns(
  t: T,
  openDetail?: (id: string) => void,
  openLinked?: (id: string) => void,
): V2Column<ProcurementOrderRow>[] {
  return [
    {
      key: "orderNo",
      ...headerFilter(t("v2.procurement.columns.orderNo", "Số đơn"), {
        showBlankOption: false,
      }),
      size: 150,
      mobileSlot: "title",
      summary: {
        variant: "label",
        label: t("v2.procurement.columns.summaryTotal", "Tổng cộng:"),
      },
      cell: (row) => (
        <V2TableText
          text={row.orderNo}
          enableCopy
          onTextClick={openDetail ? () => openDetail(row.id) : undefined}
          onDetailClick={openDetail ? () => openDetail(row.id) : undefined}
        />
      ),
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
      mobileSlot: "hidden",
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
      summary: {
        variant: "amount",
        metricTitle: t("v2.procurement.columns.total", "Tổng tiền"),
      },
      cell: (row) => formatMoney(row.totalAmount),
    },
    {
      key: "status",
      ...headerFilter.select(
        t("v2.procurement.columns.status", "Trạng thái"),
        getOrderStatusOptions(t),
      ),
      size: 140,
      align: TableColumnAlign.CENTER,
      mobileSlot: "badge",
      cell: (row) => <ProcurementStatusBadge value={row.status} t={t} />,
    },
    {
      key: "fulfillmentStatus",
      ...headerFilter.select(
        t("v2.procurement.columns.fulfillment", "Nhận hàng"),
        getOrderFulfillmentOptions(t),
      ),
      size: 140,
      align: TableColumnAlign.CENTER,
      cell: (row) => (
        <ProcurementStatusBadge value={row.fulfillmentStatus} t={t} />
      ),
    },
    {
      key: "paymentStatus",
      ...headerFilter.select(
        t("v2.procurement.columns.payment", "Thanh toán"),
        getPaymentStatusOptions(t),
      ),
      size: 140,
      align: TableColumnAlign.CENTER,
      cell: (row) => <ProcurementStatusBadge value={row.paymentStatus} t={t} />,
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
      size: 200,
      cell: (row) => row.createdByEmail ?? "—",
    },
    {
      key: "requestNo",
      ...headerFilter(t("v2.procurement.columns.linkedRequest", "Đề nghị mua")),
      size: 160,
      mobileSlot: "meta",
      cell: (row) => (
        <ProcurementLinkedDocCell
          docs={
            row.requestId && row.requestNo
              ? [{ id: row.requestId, label: row.requestNo }]
              : []
          }
          t={t}
          onOpen={openLinked}
        />
      ),
    },
  ];
}
