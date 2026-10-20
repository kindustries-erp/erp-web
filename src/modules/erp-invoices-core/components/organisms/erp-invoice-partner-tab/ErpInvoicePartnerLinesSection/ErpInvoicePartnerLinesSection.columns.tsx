import React from "react";
import { format } from "date-fns";
import type { TFunction } from "i18next";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { money } from "@/shared/utils/format";
import { formatUom } from "@/modules/erp-invoices-core/utils/uom.helper";
import { InvoiceNoCell } from "@/modules/erp-invoices-core/components/molecules/invoice-no-cell";
import type {
  ErpInvoice,
  ErpInvoiceItemRow,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface BuildItemColumnsOptions {
  itemHeaderFilter: any;
  t: TFunction;
  onPreviewInvoice?: (inv: ErpInvoice) => void;
}

export function buildItemColumns({
  itemHeaderFilter,
  t,
  onPreviewInvoice,
}: BuildItemColumnsOptions): DataTableColumn<ErpInvoiceItemRow>[] {
  return [
    {
      key: "index",
      header: <span className="w-full block text-center">#</span>,
      size: 40,
      enableResizing: false,
      headerClassName: "text-center w-[40px] min-w-[40px]",
      className: "text-center w-[40px] min-w-[40px]",
      cell: (_: any, idx: number) => (
        <span className="w-full block text-center text-muted-foreground font-medium">
          {idx}
        </span>
      ),
    },
    {
      key: "invoiceDate",
      size: 105,
      enableResizing: true,
      header: itemHeaderFilter.date("invoiceDate", t("invoiceDate", "Ngày HĐ")),
      className: "text-right font-medium",
      cell: (row: ErpInvoiceItemRow) =>
        row.invoiceDate ? format(new Date(row.invoiceDate), "dd/MM/yyyy") : "—",
    },
    {
      key: "invoiceNo",
      size: 140,
      enableResizing: true,
      header: itemHeaderFilter("invoiceNo", t("invoiceNo", "Số HĐ")),
      cell: (row: ErpInvoiceItemRow) => (
        <InvoiceNoCell
          inv={
            {
              id: row.invoiceId,
              invoiceNo: row.invoiceNo,
              serialNo: row.serialNo,
            } as any
          }
          handleOpenInternal={(targetInv) =>
            onPreviewInvoice?.(targetInv as any)
          }
        />
      ),
    },
    {
      key: "itemCode",
      size: 110,
      enableResizing: true,
      header: itemHeaderFilter("itemCode", t("itemCode", "Mã hàng")),
      cell: (row: ErpInvoiceItemRow) => (
        <span className="font-mono text-xs font-medium text-muted-foreground">
          {row.itemCode || "—"}
        </span>
      ),
    },
    {
      key: "description",
      size: 230,
      enableResizing: true,
      header: itemHeaderFilter(
        "description",
        t("description", "Diễn giải / Hàng hóa"),
      ),
      cell: (row: ErpInvoiceItemRow) => (
        <TableText text={row.description || "—"} tooltip />
      ),
    },
    {
      key: "unit",
      size: 70,
      enableResizing: true,
      className: "text-center",
      header: itemHeaderFilter("unit", t("unit", "ĐVT")),
      cell: (row: ErpInvoiceItemRow) => (
        <span className="text-center w-full block text-xs text-muted-foreground">
          {formatUom(row.unit, "—")}
        </span>
      ),
    },
    {
      key: "quantity",
      size: 85,
      enableResizing: true,
      className: "text-right tabular-nums",
      header: itemHeaderFilter.qty("quantity", t("quantity", "Số lượng")),
      cell: (row: ErpInvoiceItemRow) => (
        <span className="font-medium">
          {row.quantity != null
            ? Number(row.quantity).toLocaleString("vi-VN")
            : "—"}
        </span>
      ),
    },
    {
      key: "unitPrice",
      size: 110,
      enableResizing: true,
      className: "text-right tabular-nums",
      header: itemHeaderFilter.amount("unitPrice", t("unitPrice", "Đơn giá")),
      cell: (row: ErpInvoiceItemRow) =>
        row.unitPrice != null ? money(Number(row.unitPrice)) : "—",
    },
    {
      key: "preVatAmount",
      size: 125,
      enableResizing: true,
      className: "text-right tabular-nums",
      header: itemHeaderFilter.amount(
        "preVatAmount",
        t("preVatAmount", "Trước GTGT"),
      ),
      cell: (row: ErpInvoiceItemRow) => money(Number(row.preVatAmount) || 0),
    },
    {
      key: "vatRate",
      size: 85,
      enableResizing: true,
      className: "text-center tabular-nums font-medium",
      header: itemHeaderFilter.numeric("vatRate", t("vatRate", "Thuế suất"), {
        currencySymbol: "%",
        isCurrency: false,
      }),
      cell: (row: ErpInvoiceItemRow) => {
        if (
          row.vatRate === null ||
          row.vatRate === undefined ||
          row.vatRate === ""
        )
          return "—";
        const num = Number(row.vatRate);
        if (isNaN(num)) return String(row.vatRate);
        if (num === 0) return "0%";
        return `${Math.abs(num) <= 1 ? Math.round(num * 10000) / 100 : num}%`;
      },
    },
    {
      key: "vatAmount",
      size: 115,
      enableResizing: true,
      className: "text-right tabular-nums",
      header: itemHeaderFilter.amount("vatAmount", t("vatAmount", "Thuế GTGT")),
      cell: (row: ErpInvoiceItemRow) => money(Number(row.vatAmount) || 0),
    },
    {
      key: "totalAmount",
      size: 130,
      enableResizing: true,
      className: "text-right font-semibold tabular-nums text-foreground",
      header: itemHeaderFilter.amount(
        "totalAmount",
        t("totalAmount", "Thành tiền"),
      ),
      cell: (row: ErpInvoiceItemRow) => money(Number(row.totalAmount) || 0),
    },
    {
      key: "invoiceSubcategory",
      size: 120,
      enableResizing: true,
      header: itemHeaderFilter(
        "invoiceSubcategory",
        t("subcategory", "Phân loại"),
      ),
      cell: (row: ErpInvoiceItemRow) => (
        <span className="text-xs text-muted-foreground truncate block">
          {row.invoiceSubcategory || "—"}
        </span>
      ),
    },
  ];
}
