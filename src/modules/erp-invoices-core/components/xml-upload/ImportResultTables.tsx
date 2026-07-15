import { SkipForward, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  type BulkImportResult,
  type BulkImportSkippedItem,
  type BulkImportErrorItem,
} from "../../api/erpInvoicesCoreApi";
import { StandardTable } from "@/shared/components/StandardTable";
import { type DataTableColumn } from "@/shared/components/DataTable";

interface Props {
  result: BulkImportResult;
}

export function ImportResultTables({ result }: Props) {
  const { t } = useTranslation("erpInvoices");

  const skippedColumns: DataTableColumn<BulkImportSkippedItem>[] = [
    { key: "filename", title: t("importFile", "File"), render: (r) => r.filename, width: 120 },
    { key: "invoiceNo", title: t("invoiceNo", "Số HĐ"), render: (r) => <span className="text-primary font-medium">{r.invoiceNo}</span>, width: 100 },
    { key: "sellerName", title: t("seller", "Tên NCC"), render: (r) => <div className="max-w-[140px] truncate" title={r.sellerName}>{r.sellerName || "—"}</div>, width: 140 },
    { key: "sellerTaxCode", title: t("taxCode", "MST"), render: (r) => r.sellerTaxCode || "—", width: 100 },
    { key: "reason", title: t("importReason", "Lý do"), render: () => <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium whitespace-nowrap">{t("importReasonDuplicated", "Trùng lặp")}</span>, width: 100 },
  ];

  const errorColumns: DataTableColumn<BulkImportErrorItem>[] = [
    { key: "filename", title: t("importFile", "File"), render: (r) => r.filename, width: 160 },
    { key: "reason", title: t("importErrorReason", "Lý do lỗi"), render: (r) => <span className="text-red-700">{r.reason}</span>, width: 320 },
  ];

  const pdfAttachedColumns: DataTableColumn<any>[] = [
    { key: "filename", title: "Tên file PDF", render: (r) => r.filename, width: 200 },
    { key: "invoiceNo", title: "Số hóa đơn", render: (r) => <span className="text-emerald-600 font-semibold">{r.invoiceNo}</span>, width: 120 },
  ];

  const pdfOrphansColumns: DataTableColumn<any>[] = [
    { key: "filename", title: "Tên file PDF", render: (r) => r.filename, width: 200 },
    { key: "reason", title: "Lý do", render: (r) => <span className="text-amber-600">{r.reason}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Skipped table */}
      {result.skipped.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <SkipForward className="w-4 h-4 text-amber-600" />
            {t("importSkippedTitle", "Hóa đơn bị bỏ qua (trùng lặp)")}
          </h3>
          <StandardTable
            items={result.skipped}
            columns={skippedColumns}
            getRowKey={(r: any, i) => r.filename + r.invoiceNo + i}
            minWidth={600}
          />
        </div>
      )}

      {/* Error table */}
      {result.errors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-600" />
            {t("importErrorTitle", "Lỗi xử lý")}
          </h3>
          <StandardTable
            items={result.errors}
            columns={errorColumns}
            getRowKey={(r: any, i) => r.filename + i}
            minWidth={500}
          />
        </div>
      )}
      
      {/* PDF Attached table */}
      {result.pdfAttached && result.pdfAttached.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            PDF đã được ghép vào hóa đơn
          </h3>
          <StandardTable
            items={result.pdfAttached}
            columns={pdfAttachedColumns}
            getRowKey={(r: any, i) => r.filename + i}
            minWidth={320}
          />
        </div>
      )}

      {/* PDF Orphans table */}
      {result.pdfOrphans && result.pdfOrphans.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            PDF không ghép được (Orphans)
          </h3>
          <StandardTable
            items={result.pdfOrphans}
            columns={pdfOrphansColumns}
            getRowKey={(r: any, i) => r.filename + i}
            minWidth={320}
          />
        </div>
      )}
    </div>
  );
}
