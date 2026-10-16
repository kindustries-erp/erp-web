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
  renderPartnerNameCell,
  renderNoteCell,
  renderSttCell,
  createCashflowDateHeader,
} from "./GarageCashflowTable.helper";

import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_CONTENT_OPTIONS,
} from "./GarageCashflowTable.type";

export { getGarageCashflowRowActions } from "./GarageCashflowTable.actions";

export const getGarageCashflowColumns = (
  filterBuilder: any,
  openDetail: (row: GarageCashflowVoucher, mode: "view" | "edit") => void,
  onOpenCaseDetail?: (caseCode: string) => void,
  tableHook?: any,
): DataTableColumn<GarageCashflowVoucher>[] => {
  return [
    {
      key: "stt",
      header: <span className="w-full block text-center">#</span>,
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
      header: createCashflowDateHeader("transDate", "Ngày", tableHook),
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
      header: createCashflowDateHeader("createdAt", "Ngày tạo", tableHook),
      className: "text-right",
      cell: (row) => (
        <TableDateCell date={row.createdAt} className="justify-end w-full" />
      ),
    },
    {
      key: "voucherCode",
      sortKey: "voucherCode",
      size: 160,
      header: filterBuilder("voucherCode", "Mã phiếu", {
        valueType: ColumnValueType.TEXT,
      }),
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
      header: filterBuilder.amount("thu", "Tiền vào (Thu)", {
        valueType: ColumnValueType.NUMBER,
        align: "right",
      }),
      className: "text-right",
      headerClassName: "text-right",
      cell: renderThuCell,
    },
    {
      key: "chi",
      sortKey: "amount",
      size: 140,
      header: filterBuilder.amount("chi", "Tiền ra (Chi)", {
        valueType: ColumnValueType.NUMBER,
        align: "right",
      }),
      className: "text-right",
      headerClassName: "text-right",
      cell: renderChiCell,
    },
    {
      key: "paymentMethod",
      sortKey: "paymentMethod",
      size: 160,
      header: filterBuilder("paymentMethod", "Phương thức TT", {
        valueType: ColumnValueType.SELECT,
        filterOptions: PAYMENT_METHOD_OPTIONS,
      }),
      cell: renderPaymentMethodCell,
    },
    {
      key: "paymentContent",
      sortKey: "paymentContent",
      size: 160,
      header: filterBuilder("paymentContent", "Nội dung TT", {
        valueType: ColumnValueType.SELECT,
        filterOptions: PAYMENT_CONTENT_OPTIONS,
        showBlankOption: true,
      }),
      cell: renderPaymentContentCell,
    },
    {
      key: "caseCode",
      sortKey: "caseCode",
      size: 180,
      className: "text-left",
      header: filterBuilder("caseCode", "Mã PDV", {
        valueType: ColumnValueType.TEXT,
        showBlankOption: true,
      }),
      cell: (row) => renderCaseCodeCell(row, onOpenCaseDetail),
    },
    {
      key: "licensePlate",
      sortKey: "licensePlate",
      size: 130,
      className: "text-left",
      header: filterBuilder("licensePlate", "Biển số xe", {
        valueType: ColumnValueType.TEXT,
        showBlankOption: true,
      }),
      cell: renderLicensePlateCell,
    },
    {
      key: "partnerName",
      sortKey: "partnerName",
      size: 200,
      header: filterBuilder("partnerName", "Đối tác", {
        valueType: ColumnValueType.TEXT,
        showBlankOption: true,
      }),
      cell: renderPartnerNameCell,
    },
    {
      key: "note",
      size: 250,
      header: filterBuilder("note", "Diễn giải", {
        valueType: ColumnValueType.TEXT,
        showBlankOption: true,
      }),
      cell: renderNoteCell,
    },
  ];
};
