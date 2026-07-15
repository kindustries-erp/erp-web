import { SkipForward, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  type BulkImportResult,
  type BulkImportSkippedItem,
  type BulkImportErrorItem,
} from "../../api/erpInvoicesCoreApi";

interface Props {
  result: BulkImportResult;
}

export function ImportResultTables({ result }: Props) {
  const { t } = useTranslation("erpInvoices");

  return (
    <>
      {/* Skipped table */}
      {result.skipped.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <SkipForward className="w-4 h-4 text-amber-600" />
            {t("importSkippedTitle", "Hóa đơn bị bỏ qua (trùng lặp)")}
          </h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                  <th className="text-left px-3 py-2 font-medium">
                    {t("importFile", "File")}
                  </th>
                  <th className="text-left px-3 py-2 font-medium">
                    {t("invoiceNo", "Số HĐ")}
                  </th>
                  <th className="text-left px-3 py-2 font-medium">
                    {t("seller", "Tên NCC")}
                  </th>
                  <th className="text-left px-3 py-2 font-medium">
                    {t("taxCode", "MST")}
                  </th>
                  <th className="text-left px-3 py-2 font-medium">
                    {t("importReason", "Lý do")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.skipped.map((s: BulkImportSkippedItem, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-3 py-2 text-muted-foreground max-w-[120px] truncate">
                      {s.filename}
                    </td>
                    <td className="px-3 py-2 font-medium text-primary">
                      {s.invoiceNo}
                    </td>
                    <td className="px-3 py-2 max-w-[140px] truncate">
                      {s.sellerName || "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {s.sellerTaxCode || "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                        {t("importReasonDuplicated", "Trùng lặp")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error table */}
      {result.errors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-600" />
            {t("importErrorTitle", "Lỗi xử lý")}
          </h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                  <th className="text-left px-3 py-2 font-medium">
                    {t("importFile", "File")}
                  </th>
                  <th className="text-left px-3 py-2 font-medium">
                    {t("importErrorReason", "Lý do lỗi")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.errors.map((e: BulkImportErrorItem, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-3 py-2 text-muted-foreground max-w-[160px] truncate">
                      {e.filename}
                    </td>
                    <td className="px-3 py-2 text-red-700 max-w-[320px]">
                      {e.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* PDF Attached table */}
      {result.pdfAttached && result.pdfAttached.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            PDF đã được ghép vào hóa đơn
          </h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-emerald-50/50 text-muted-foreground">
                  <th className="text-left px-3 py-2 font-medium">Tên file PDF</th>
                  <th className="text-left px-3 py-2 font-medium">Số hóa đơn</th>
                </tr>
              </thead>
              <tbody>
                {result.pdfAttached.map((s, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-2 text-muted-foreground font-medium truncate">{s.filename}</td>
                    <td className="px-3 py-2 text-emerald-600 font-semibold">{s.invoiceNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PDF Orphans table */}
      {result.pdfOrphans && result.pdfOrphans.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            PDF không ghép được (Orphans)
          </h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-amber-50/50 text-muted-foreground">
                  <th className="text-left px-3 py-2 font-medium">Tên file PDF</th>
                  <th className="text-left px-3 py-2 font-medium">Lý do</th>
                </tr>
              </thead>
              <tbody>
                {result.pdfOrphans.map((s, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-2 text-muted-foreground font-medium truncate">{s.filename}</td>
                    <td className="px-3 py-2 text-amber-600">{s.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
