import * as React from "react";
import { V2TableText } from "@/v2/shared/components/molecules/v2-table-text";
import { headerFilter } from "@/v2/shared/components/organisms/v2-standard-table/utils/v2HeaderFilterBuilder";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table/V2StandardTable.type";
import { ProcurementStatusBadge } from "../components/molecules/procurement-status-badge";
import type { ProcurementRequestRow } from "../procurement.types";

type T = (key: string, fallback: string) => string;

const formatMoney = (value: string | number | null | undefined) =>
  value == null || value === ""
    ? "—"
    : Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 0 });

const formatDate = (value: string | null | undefined) =>
  value ? value.slice(0, 10) : "—";

const getRequestStatusOptions = (t: T) => [
  { value: "DRAFT", label: t("v2.procurement.status.DRAFT", "Bản nháp") },
  {
    value: "PENDING_APPROVAL",
    label: t("v2.procurement.status.PENDING_APPROVAL", "Chờ duyệt"),
  },
  {
    value: "SUBMITTED",
    label: t("v2.procurement.status.SUBMITTED", "Chờ duyệt"),
  },
  { value: "APPROVED", label: t("v2.procurement.status.APPROVED", "Đã duyệt") },
  { value: "REJECTED", label: t("v2.procurement.status.REJECTED", "Từ chối") },
  { value: "CANCELLED", label: t("v2.procurement.status.CANCELLED", "Đã hủy") },
  { value: "CLOSED", label: t("v2.procurement.status.CLOSED", "Đã đóng") },
];

const getOrderingStatusOptions = (t: T) => [
  { value: "NONE", label: t("v2.procurement.status.NONE", "Chưa đặt") },
  { value: "PARTIAL", label: t("v2.procurement.status.PARTIAL", "Đang đặt") },
  { value: "FULL", label: t("v2.procurement.status.FULL", "Đã đặt đủ") },
];

/** Cột bảng đề nghị mua hàng (PR) garage chuẩn V2 table. */
export function buildProcurementRequestColumns(
  t: T,
  openDetail?: (id: string) => void,
): V2Column<ProcurementRequestRow>[] {
  return [
    {
      key: "requestNo",
      ...headerFilter(t("v2.procurement.columns.requestNo", "Số đề nghị"), {
        showBlankOption: false,
      }),
      size: 160,
      mobileSlot: "title",
      cell: (row) => (
        <V2TableText
          text={row.requestNo}
          enableCopy
          onTextClick={openDetail ? () => openDetail(row.id) : undefined}
          onDetailClick={openDetail ? () => openDetail(row.id) : undefined}
        />
      ),
    },
    {
      key: "requestDate",
      ...headerFilter.date(
        t("v2.procurement.columns.requestDate", "Ngày đề nghị"),
      ),
      size: 130,
      align: TableColumnAlign.RIGHT,
      mobileSlot: "subtitle",
      cell: (row) => formatDate(row.requestDate ?? row.createdAt),
    },
    {
      key: "title",
      ...headerFilter(t("v2.procurement.columns.title", "Nội dung")),
      size: 220,
      mobileSlot: "meta",
      cell: (row) => row.title ?? "—",
    },
    {
      key: "branchName",
      ...headerFilter(t("v2.procurement.columns.branch", "Chi nhánh")),
      size: 140,
      mobileSlot: "meta",
      cell: (row) => row.branchName ?? "—",
    },
    {
      key: "estimatedTotal",
      ...headerFilter.amount(
        t("v2.procurement.columns.estimatedTotal", "Tổng dự kiến"),
      ),
      size: 140,
      align: TableColumnAlign.RIGHT,
      cell: (row) => formatMoney(row.estimatedTotal),
    },
    {
      key: "status",
      ...headerFilter.select(
        t("v2.procurement.columns.status", "Trạng thái"),
        getRequestStatusOptions(t),
      ),
      size: 140,
      align: TableColumnAlign.CENTER,
      cell: (row) => <ProcurementStatusBadge value={row.status} t={t} />,
    },
    {
      key: "orderingStatus",
      ...headerFilter.select(
        t("v2.procurement.columns.ordering", "Tiến độ đặt"),
        getOrderingStatusOptions(t),
      ),
      size: 140,
      align: TableColumnAlign.CENTER,
      cell: (row) => (
        <ProcurementStatusBadge value={row.orderingStatus} t={t} />
      ),
    },
    {
      key: "createdBy",
      ...headerFilter(t("v2.procurement.columns.createdBy", "Người tạo")),
      size: 140,
      mobileSlot: "hidden",
      cell: (row) => row.createdBy ?? "—",
    },
  ];
}
