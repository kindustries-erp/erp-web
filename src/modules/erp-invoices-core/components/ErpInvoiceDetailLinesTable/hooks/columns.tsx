import React from "react";
import type { TFunction } from "i18next";
import { TableText } from "@/shared/components/DataTable/TableText";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { money } from "@/shared/utils/format";
import type { OutInvoiceLineDisplayResult } from "../../../utils/outInvoiceDisplay";
import { formatVatRate } from "../../ErpInvoiceItemsSection/components/itemColumns";

export function getInvoiceDetailLinesColumns(
  t: TFunction<"erpInvoices", undefined>,
): DataTableColumn<OutInvoiceLineDisplayResult>[] {
  return [
    // 1. Cột STT: 40px, căn giữa
    {
      key: "index",
      header: <span className="w-full block text-center">#</span>,
      size: 40,
      enableResizing: false,
      headerClassName: "text-center w-[40px] min-w-[40px]",
      className: "text-center w-[40px] min-w-[40px]",
      cell: (_: OutInvoiceLineDisplayResult, idx: number) => (
        <span className="w-full block text-center text-xs text-muted-foreground">
          {idx}
        </span>
      ),
    },

    // 2. Tên hàng hóa, dịch vụ / Diễn giải
    {
      key: "description",
      header: t("description", "Tên hàng hóa, dịch vụ"),
      size: 300,
      enableResizing: true,
      cell: (row: OutInvoiceLineDisplayResult) => (
        <div className="flex items-center gap-1.5 w-full min-w-0">
          <TableText
            text={row.description || "—"}
            className="font-medium text-foreground text-xs min-w-0 flex-1"
            tooltip={true}
            enableCopy={Boolean(row.description)}
          />
        </div>
      ),
    },

    // 3. Đơn vị tính (ĐVT)
    {
      key: "unit",
      header: (
        <span className="w-full block text-center">{t("unit", "ĐVT")}</span>
      ),
      size: 70,
      headerClassName: "text-center",
      className: "text-center",
      cell: (row: OutInvoiceLineDisplayResult) => (
        <span className="text-xs text-muted-foreground">{row.unit || "—"}</span>
      ),
    },

    // 4. Số lượng
    {
      key: "quantity",
      header: (
        <span className="w-full block text-right">
          {t("quantity", "Số lượng")}
        </span>
      ),
      size: 80,
      headerClassName: "text-right",
      className: "text-right",
      cell: (row: OutInvoiceLineDisplayResult) => (
        <span className="tabular-nums font-mono text-xs text-foreground">
          {row.quantity != null
            ? Number(row.quantity).toLocaleString("vi-VN")
            : "0"}
        </span>
      ),
    },

    // 5. Đơn giá
    {
      key: "unitPrice",
      header: (
        <span className="w-full block text-right">
          {t("unitPrice", "Đơn giá")}
        </span>
      ),
      size: 110,
      headerClassName: "text-right",
      className: "text-right",
      cell: (row: OutInvoiceLineDisplayResult) => (
        <span className="tabular-nums font-mono text-xs text-foreground">
          {money(row.unitPrice || 0)}
        </span>
      ),
    },

    // 6. Chiết khấu
    {
      key: "discountAmount",
      header: (
        <span className="w-full block text-right">
          {t("discountAmount", "Chiết khấu")}
        </span>
      ),
      size: 100,
      headerClassName: "text-right",
      className: "text-right",
      cell: (row: OutInvoiceLineDisplayResult) => (
        <span className="tabular-nums font-mono text-xs text-muted-foreground">
          {row.discountAmount ? money(row.discountAmount) : "—"}
        </span>
      ),
    },

    // 7. Thuế suất
    {
      key: "vatRate",
      header: (
        <span className="w-full block text-center">
          {t("vatRate", "Thuế suất")}
        </span>
      ),
      size: 80,
      headerClassName: "text-center",
      className: "text-center",
      cell: (row: OutInvoiceLineDisplayResult) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatVatRate(row.vatRate)}
        </span>
      ),
    },

    // 8. Tiền thuế GTGT
    {
      key: "vatAmount",
      header: (
        <span className="w-full block text-right">
          {t("vatAmount", "Tiền thuế")}
        </span>
      ),
      size: 110,
      headerClassName: "text-right",
      className: "text-right",
      cell: (row: OutInvoiceLineDisplayResult) => (
        <span className="tabular-nums font-mono text-xs text-foreground">
          {money(row.vatAmount || 0)}
        </span>
      ),
    },

    // 9. Thành tiền chưa thuế
    {
      key: "preVatAmount",
      header: (
        <span className="w-full block text-right">
          {t("preVatAmount", "Tiền chưa thuế")}
        </span>
      ),
      size: 130,
      headerClassName: "text-right",
      className: "text-right",
      cell: (row: OutInvoiceLineDisplayResult) => (
        <span className="tabular-nums font-mono font-medium text-xs text-foreground">
          {money(row.preVatAmount || 0)}
        </span>
      ),
    },

    // 10. Tổng thành tiền
    {
      key: "totalAmount",
      header: (
        <span className="w-full block text-right">
          {t("totalAmount", "Tổng tiền")}
        </span>
      ),
      size: 140,
      headerClassName: "text-right",
      className: "text-right",
      cell: (row: OutInvoiceLineDisplayResult) => (
        <span className="tabular-nums font-mono font-semibold text-xs text-primary">
          {money(row.totalAmount || 0)}
        </span>
      ),
    },
  ];
}
