import React from "react";
import {
  ColumnValueType,
  type DataTableColumn,
} from "@/shared/components/DataTable/types";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { TableText } from "@/shared/components/DataTable/TableText";

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
      cell: (_: any, idx: number) => (
        <span className="w-full block text-center font-mono text-xs text-muted-foreground">
          {idx}
        </span>
      ),
    },
    {
      key: "createdAt",
      sortKey: "createdAt",
      size: 110,
      header: filterBuilder.date("createdAt", "Ngày tạo"),
      cell: (row) => {
        if (!row.createdAt) return "—";
        const d = new Date(row.createdAt);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {d.toLocaleDateString("vi-VN")}
            </span>
            <span className="text-xs text-slate-500">
              {d.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
      },
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
      cell: (row) => {
        return row.case?.soChungTu ? (
          <TableText
            text={row.case.soChungTu}
            enableCopy
            textClassName="font-mono text-xs border border-input rounded-md px-2 py-0.5"
          />
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: "voucherType",
      sortKey: "voucherType",
      size: 120,
      header: filterBuilder.client("voucherType", "Loại phiếu", {
        valueType: ColumnValueType.TEXT,
        filterOptions: [
          { label: "Thu (RECEIPT)", value: "RECEIPT" },
          { label: "Chi (PAYMENT)", value: "PAYMENT" },
        ],
      }),
      cell: (row) => {
        const type = (row.voucherType || "").toUpperCase();
        return (
          <span
            className={
              type === "RECEIPT"
                ? "text-emerald-600 font-medium"
                : "text-rose-600 font-medium"
            }
          >
            {type === "RECEIPT" ? "Phiếu Thu" : "Phiếu Chi"}
          </span>
        );
      },
    },
    {
      key: "amount",
      sortKey: "amount",
      size: 140,
      header: filterBuilder.amount("amount", "Số tiền", {
        valueType: ColumnValueType.NUMBER,
        align: "right",
      }),
      className: "text-right",
      headerClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums font-medium block w-full text-right">
          {Number(row.amount || 0).toLocaleString("vi-VN")} đ
        </span>
      ),
    },
    {
      key: "partnerName",
      sortKey: "partnerName",
      size: 200,
      header: filterBuilder("partnerName", "Đối tác", {
        valueType: ColumnValueType.TEXT,
      }),
      cell: (row) => {
        const name = row.partnerName || row.case?.khachHangName || "—";
        return (
          <span className="truncate block" title={name}>
            {name}
          </span>
        );
      },
    },
    {
      key: "note",
      size: 250,
      header: filterBuilder("note", "Diễn giải", {
        valueType: ColumnValueType.TEXT,
      }),
      cell: (row) => (
        <span
          className="text-muted-foreground text-xs truncate block"
          title={row.note || ""}
        >
          {row.note || "—"}
        </span>
      ),
    },
  ];
};

export const getGarageCashflowRowActions = (
  openDetail: (row: GarageCashflowVoucher, mode: "view" | "edit") => void,
  onDelete?: (row: GarageCashflowVoucher) => void,
) => {
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
        {
          key: "edit",
          label: "Chỉnh sửa",
          icon: <Pencil className="w-4 h-4" />,
          onClick: () => openDetail(row, "edit"),
        },
      ],
    },
    {
      groupLabel: "Khác",
      items: [
        {
          key: "delete",
          label: "Xóa phiếu",
          icon: <Trash2 className="w-4 h-4" />,
          variant: "danger" as const,
          onClick: () => {
            if (onDelete) onDelete(row);
          },
        },
      ],
    },
  ];
};
