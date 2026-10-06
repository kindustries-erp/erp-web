import React from "react";
import type { TFunction } from "i18next";
import { TableText } from "@/shared/components/DataTable/TableText";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { money } from "@/shared/utils/format";
import type { OutInvoiceLineDisplayResult } from "@/modules/erp-invoices-core/utils/outInvoiceDisplay";
import { formatVatRate } from "@/modules/erp-invoices-core/components/organisms/erp-invoice-items-section/ErpInvoiceItemsSection.columns";
import { formatUom } from "@/modules/erp-invoices-core/utils/uom.helper";

export function getInvoiceDetailLinesColumns(
  t: TFunction<"erpInvoices", undefined>,
): DataTableColumn<OutInvoiceLineDisplayResult>[] {
  return [
    // 1. Cột STT: 40px, căn giữa
    {
      key: "index",
      header: <span className="w-full block text-center font-semibold">#</span>,
      size: 40,
      enableResizing: false,
      headerClassName: "text-center w-[40px] min-w-[40px] font-semibold",
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
      header: (
        <span className="uppercase font-semibold">
          {t("description", "Diễn giải")}
        </span>
      ),
      size: 300,
      enableResizing: true,
      headerClassName: "uppercase font-semibold",
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
        <span className="w-full block text-center uppercase font-semibold">
          {t("unit", "ĐVT")}
        </span>
      ),
      size: 70,
      headerClassName: "text-center uppercase font-semibold",
      className: "text-center",
      cell: (row: OutInvoiceLineDisplayResult) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {formatUom(row.unit)}
        </span>
      ),
    },

    // 4. Số lượng
    {
      key: "quantity",
      header: (
        <span className="w-full block text-right uppercase font-semibold">
          {t("quantity", "Số lượng")}
        </span>
      ),
      size: 80,
      headerClassName: "text-right uppercase font-semibold",
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
        <span className="w-full block text-right uppercase font-semibold">
          {t("unitPrice", "Đơn giá")}
        </span>
      ),
      size: 110,
      headerClassName: "text-right uppercase font-semibold",
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
        <span className="w-full block text-right uppercase font-semibold">
          {t("discountAmount", "Chiết khấu")}
        </span>
      ),
      size: 100,
      headerClassName: "text-right uppercase font-semibold",
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
        <span className="w-full block text-center uppercase font-semibold">
          {t("vatRate", "Thuế suất")}
        </span>
      ),
      size: 80,
      headerClassName: "text-center uppercase font-semibold",
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
        <span className="w-full block text-right uppercase font-semibold">
          {t("vatAmount", "Thuế GTGT")}
        </span>
      ),
      size: 110,
      headerClassName: "text-right uppercase font-semibold",
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
        <span className="w-full block text-right uppercase font-semibold">
          {t("preVatAmount", "Trước GTGT")}
        </span>
      ),
      size: 130,
      headerClassName: "text-right uppercase font-semibold",
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
        <span className="w-full block text-right uppercase font-semibold">
          {t("totalAmount", "Thành tiền")}
        </span>
      ),
      size: 140,
      headerClassName: "text-right uppercase font-semibold",
      className: "text-right",
      cell: (row: OutInvoiceLineDisplayResult) => (
        <span className="tabular-nums font-mono font-semibold text-xs text-primary">
          {money(row.totalAmount || 0)}
        </span>
      ),
    },
  ];
}
