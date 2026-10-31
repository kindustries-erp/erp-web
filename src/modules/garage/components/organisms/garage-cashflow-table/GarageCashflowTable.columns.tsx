import React from "react";
import {
  ColumnValueType,
  type DataTableColumn,
} from "@/shared/components/DataTable/types";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import {
  renderThuCell,
  renderChiCell,
  renderCaseCodeCell,
  renderLicensePlateCell,
  renderPaymentMethodCell,
  renderPaymentContentCell,
  renderPaymentStatusCell,
  renderPartnerNameCell,
  renderNoteCell,
  renderSttCell,
  createCashflowDateHeader,
} from "./GarageCashflowTable.helper";
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_CONTENT_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "./GarageCashflowTable.type";

export { getGarageCashflowRowActions } from "./GarageCashflowTable.actions";

export const getGarageCashflowColumns = (
  filterBuilder: any,
  openDetail: (row: GarageCashflowVoucher, mode: "view" | "edit") => void,
  onOpenCaseDetail?: (caseCode: string) => void,
  tableHook?: any,
  tabKey: "vouchers" | "forecast" = "vouchers",
  t?: (key: string, def?: string) => string,
): DataTableColumn<GarageCashflowVoucher>[] => {
  const tr = t || ((_: string, def?: string) => def || "");
  const isForecast = tabKey === "forecast";

  return [
    {
      key: "stt",
      header: (
        <span className="w-full block text-center">
          {tr("garage.cashflow.columns.stt", "#")}
        </span>
      ),
      size: 40,
      className: "text-center w-[40px] min-w-[40px]",
      headerClassName: "text-center w-[40px] min-w-[40px]",
      enableResizing: false,
      cell: renderSttCell,
    },
    {
      key: "transDate",
      sortKey: "transDate",
      size: 110,
      header: createCashflowDateHeader(
        "transDate",
        isForecast
          ? tr("garage.cashflow.columns.expectedDate", "Ngày dự kiến")
          : tr("garage.cashflow.columns.transDate", "Ngày"),
        tableHook,
      ),
      className: "text-right",
      cell: (row) => (
        <TableDateCell
          date={row.transDate}
          format="date"
          className="justify-end w-full"
        />
      ),
    },
    {
      key: "createdAt",
      sortKey: "createdAt",
      size: 110,
      header: createCashflowDateHeader(
        "createdAt",
        tr("garage.cashflow.columns.createdAt", "Ngày tạo"),
        tableHook,
      ),
      className: "text-right",
      cell: (row) => (
        <TableDateCell date={row.createdAt} className="justify-end w-full" />
      ),
    },
    {
      key: "voucherCode",
      sortKey: "voucherCode",
      size: 160,
      header: filterBuilder(
        "voucherCode",
        tr("garage.cashflow.columns.voucherCode", "Mã phiếu"),
        { valueType: ColumnValueType.TEXT },
      ),
      cell: (row) => (
        <TableText
          text={row.voucherCode || ""}
          enableCopy
          onDetailClick={() => openDetail(row, "view")}
        />
      ),
    },
    {
      key: "thu",
      sortKey: "amount",
      size: 140,
      header: filterBuilder.amount(
        "thu",
        isForecast
          ? tr("garage.cashflow.columns.forecastThu", "Tiền vào (Dự thu)")
          : tr("garage.cashflow.columns.thu", "Tiền vào (Thu)"),
        { valueType: ColumnValueType.NUMBER, align: "right" },
      ),
      className: "text-right",
      headerClassName: "text-right",
      cell: renderThuCell,
    },
    {
      key: "chi",
      sortKey: "amount",
      size: 140,
      header: filterBuilder.amount(
        "chi",
        isForecast
          ? tr("garage.cashflow.columns.forecastChi", "Tiền ra (Dự chi)")
          : tr("garage.cashflow.columns.chi", "Tiền ra (Chi)"),
        { valueType: ColumnValueType.NUMBER, align: "right" },
      ),
      className: "text-right",
      headerClassName: "text-right",
      cell: renderChiCell,
    },
    {
      key: "paymentStatus",
      sortKey: "paymentStatus",
      size: 130,
      header: filterBuilder(
        "paymentStatus",
        tr("garage.cashflow.columns.paymentStatus", "Trạng thái"),
        {
          valueType: ColumnValueType.SELECT,
          filterOptions: PAYMENT_STATUS_OPTIONS,
        },
      ),
      cell: (row) => renderPaymentStatusCell(row, tr),
    },
    {
      key: "paymentMethod",
      sortKey: "paymentMethod",
      size: 160,
      header: filterBuilder(
        "paymentMethod",
        tr("garage.cashflow.columns.paymentMethod", "Phương thức TT"),
        {
          valueType: ColumnValueType.SELECT,
          filterOptions: PAYMENT_METHOD_OPTIONS,
        },
      ),
      cell: renderPaymentMethodCell,
    },
    {
      key: "paymentContent",
      sortKey: "paymentContent",
      size: 160,
      header: filterBuilder(
        "paymentContent",
        tr("garage.cashflow.columns.paymentContent", "Nội dung TT"),
        {
          valueType: ColumnValueType.SELECT,
          filterOptions: PAYMENT_CONTENT_OPTIONS,
          showBlankOption: true,
        },
      ),
      cell: renderPaymentContentCell,
    },
    {
      key: "caseCode",
      sortKey: "caseCode",
      size: 180,
      className: "text-left",
      header: filterBuilder(
        "caseCode",
        tr("garage.cashflow.columns.caseCode", "Mã PDV"),
        { valueType: ColumnValueType.TEXT, showBlankOption: true },
      ),
      cell: (row) => renderCaseCodeCell(row, onOpenCaseDetail),
    },
    {
      key: "licensePlate",
      sortKey: "licensePlate",
      size: 130,
      className: "text-left",
      header: filterBuilder(
        "licensePlate",
        tr("garage.cashflow.columns.licensePlate", "Biển số xe"),
        { valueType: ColumnValueType.TEXT, showBlankOption: true },
      ),
      cell: renderLicensePlateCell,
    },
    {
      key: "partnerName",
      sortKey: "partnerName",
      size: 200,
      header: filterBuilder(
        "partnerName",
        tr("garage.cashflow.columns.partnerName", "Đối tác / Khách hàng"),
        { valueType: ColumnValueType.TEXT, showBlankOption: true },
      ),
      cell: renderPartnerNameCell,
    },
    {
      key: "note",
      size: 250,
      header: filterBuilder(
        "note",
        tr("garage.cashflow.columns.note", "Ghi chú"),
        { valueType: ColumnValueType.TEXT, showBlankOption: true },
      ),
      cell: renderNoteCell,
    },
  ];
};
