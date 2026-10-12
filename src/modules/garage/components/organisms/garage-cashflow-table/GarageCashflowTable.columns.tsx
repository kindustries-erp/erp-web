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
  renderPartnerNameCell,
  renderNoteCell,
  renderSttCell,
} from "./GarageCashflowTable.helper";

export { getGarageCashflowRowActions } from "./GarageCashflowTable.actions";

export const getGarageCashflowColumns = (
  filterBuilder: any,
  openDetail: (row: GarageCashflowVoucher, mode: "view" | "edit") => void,
  onOpenCaseDetail?: (caseCode: string) => void,
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
      header: filterBuilder.date("transDate", "Ngày", {
        hideFilter: true,
        hideFooter: true,
      }),
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
      header: filterBuilder.date("createdAt", "Ngày tạo", {
        hideFilter: true,
        hideFooter: true,
      }),
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
      key: "caseCode",
      sortKey: "caseCode",
      size: 160,
      header: filterBuilder("caseCode", "Mã PDV", {
        valueType: ColumnValueType.TEXT,
      }),
      cell: (row) => renderCaseCodeCell(row, onOpenCaseDetail),
    },
    {
      key: "licensePlate",
      sortKey: "licensePlate",
      size: 130,
      header: filterBuilder("licensePlate", "Biển số xe", {
        valueType: ColumnValueType.TEXT,
      }),
      cell: renderLicensePlateCell,
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
      size: 140,
      header: filterBuilder("paymentMethod", "Phương thức TT", {
        valueType: ColumnValueType.SELECT,
        options: [
          { label: "Tiền mặt", value: "Tiền mặt" },
          { label: "Chuyển khoản", value: "Chuyển khoản" },
          { label: "Ứng trước", value: "Ứng trước" },
          { label: "Thẻ tín dụng", value: "Thẻ tín dụng" },
          { label: "Cấn trừ", value: "Cấn trừ" },
          { label: "Khác", value: "Khác" },
        ],
      }),
      cell: renderPaymentMethodCell,
    },
    {
      key: "partnerName",
      sortKey: "partnerName",
      size: 200,
      header: filterBuilder("partnerName", "Đối tác", {
        valueType: ColumnValueType.TEXT,
      }),
      cell: renderPartnerNameCell,
    },
    {
      key: "note",
      size: 250,
      header: filterBuilder("note", "Diễn giải", {
        valueType: ColumnValueType.TEXT,
      }),
      cell: renderNoteCell,
    },
  ];
};
