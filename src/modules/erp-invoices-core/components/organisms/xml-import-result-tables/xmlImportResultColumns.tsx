import type { TFunction } from "i18next";
import { PanelRightOpen } from "lucide-react";
import type {
  BulkImportErrorItem,
  BulkImportResult,
  BulkImportSkippedItem,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import type { XmlImportResultColumn } from "@/modules/erp-invoices-core/components/molecules/xml-import-result-table";

type PdfAttachedItem = NonNullable<BulkImportResult["pdfAttached"]>[number];
type PdfOrphanItem = NonNullable<BulkImportResult["pdfOrphans"]>[number];

export function skippedColumns(
  t: TFunction,
): XmlImportResultColumn<BulkImportSkippedItem>[] {
  return [
    {
      key: "filename",
      header: t("importFile", "File"),
      cell: (r) => r.filename,
    },
    {
      key: "invoiceNo",
      header: t("invoiceNo", "Số HĐ"),
      cell: (r) => (
        <span className="font-medium text-primary">{r.invoiceNo}</span>
      ),
    },
    {
      key: "sellerName",
      header: t("seller", "Tên NCC"),
      cell: (r) => (
        <span
          className="block max-w-[140px] truncate"
          title={r.sellerName || undefined}
        >
          {r.sellerName || "—"}
        </span>
      ),
    },
    {
      key: "sellerTaxCode",
      header: t("taxCode", "MST"),
      cell: (r) => r.sellerTaxCode || "—",
    },
    {
      key: "reason",
      header: t("importReason", "Lý do"),
      cell: () => (
        <span className="whitespace-nowrap rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800">
          {t("importReasonDuplicated", "Trùng lặp")}
        </span>
      ),
    },
  ];
}

export function errorColumns(
  t: TFunction,
): XmlImportResultColumn<BulkImportErrorItem>[] {
  return [
    {
      key: "filename",
      header: t("importFile", "File"),
      cell: (r) => r.filename,
    },
    {
      key: "reason",
      header: t("importErrorReason", "Lý do lỗi"),
      cell: (r) => <span className="text-destructive">{r.reason}</span>,
    },
  ];
}

export function pdfAttachedColumns(
  onOpenInvoice?: (invoiceId: string) => void,
): XmlImportResultColumn<PdfAttachedItem>[] {
  return [
    {
      key: "filename",
      header: "Tên file PDF",
      cell: (r) => (
        <span
          className="block max-w-[160px] truncate text-xs text-muted-foreground"
          title={r.filename}
        >
          {r.filename}
        </span>
      ),
    },
    {
      key: "invoiceNo",
      header: "Số HĐ",
      className: "font-medium text-primary",
      cell: (r) =>
        r.invoiceId && onOpenInvoice ? (
          <button
            type="button"
            onClick={() => onOpenInvoice(r.invoiceId as string)}
            className="flex w-full items-center justify-between gap-1 text-primary hover:text-primary/80"
          >
            <span className="truncate">{r.invoiceNo}</span>
            <PanelRightOpen className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </button>
        ) : (
          <span className="truncate">{r.invoiceNo}</span>
        ),
    },
    {
      key: "serialNo",
      header: "Ký hiệu",
      className: "text-muted-foreground",
      cell: (r) => r.serialNo || "—",
    },
    {
      key: "sellerName",
      header: "Bên bán",
      cell: (r) => (
        <span
          className="block max-w-[180px] truncate"
          title={r.sellerName || undefined}
        >
          {r.sellerName || "—"}
        </span>
      ),
    },
    {
      key: "totalAmount",
      header: "Thành tiền",
      headerClassName: "text-right",
      className: "text-right tabular-nums",
      cell: (r) =>
        r.totalAmount
          ? `${Number(r.totalAmount).toLocaleString("vi-VN")} đ`
          : "—",
    },
  ];
}

export function pdfOrphanColumns(): XmlImportResultColumn<PdfOrphanItem>[] {
  return [
    { key: "filename", header: "Tên file PDF", cell: (r) => r.filename },
    {
      key: "reason",
      header: "Lý do",
      cell: (r) => <span className="text-amber-600">{r.reason}</span>,
    },
  ];
}
