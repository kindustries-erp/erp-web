import React from "react";
import {
  ColumnValueType,
  type DataTableColumn,
} from "@/shared/components/DataTable/types";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import {
  renderThuCell,
  renderChiCell,
  renderCaseCodeCell,
  renderPartnerNameCell,
  renderNoteCell,
  renderSttCell,
} from "./GarageCashflowTable.helper";

export const getGarageCashflowColumns = (
  filterBuilder: any,
  openDetail: (row: GarageCashflowVoucher, mode: "view" | "edit") => void,
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
      cell: renderCaseCodeCell,
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

export const getGarageCashflowRowActions = (
  openDetail: (row: GarageCashflowVoucher, mode: "view" | "edit") => void,
  onDelete?: (row: GarageCashflowVoucher) => void,
  canEdit: boolean = true,
  canDelete: boolean = true,
) => {
  const showDelete = Boolean(canDelete && onDelete);
  return (row: GarageCashflowVoucher) => [
    {
      groupLabel: "Thao tác chính",
      items: [
        {
          key: "view",
          label: "Xem chi tiết",
          icon: <Eye className="w-4 h-4" />,
          onClick: () => openDetail(row, "view"),
        },
        ...(canEdit
          ? [
              {
                key: "edit",
                label: "Chỉnh sửa",
                icon: <Pencil className="w-4 h-4" />,
                onClick: () => openDetail(row, "edit"),
              },
            ]
          : []),
      ],
    },
    ...(showDelete
      ? [
          {
            groupLabel: "Khác",
            items: [
              {
                key: "delete",
                label: "Xóa phiếu",
                icon: <Trash2 className="w-4 h-4 text-red-500" />,
                onClick: () => onDelete!(row),
              },
            ],
          },
        ]
      : []),
  ];
};
